require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

const PORT = Number(process.env.PORT || 5050);
const DEFAULT_FRONTEND_REDIRECT = process.env.FRONTEND_REDIRECT_URI || 'http://localhost:5173';
const STRAVA_BASE_URL = 'https://www.strava.com';

app.use(cors());
app.use(express.json());

const stravaClient = axios.create({
  baseURL: STRAVA_BASE_URL,
  timeout: 15000,
});

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const hasOAuthConfig = () =>
  Boolean(process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET && process.env.STRAVA_REDIRECT_URI);

const logAxiosError = (context, err) => {
  if (axios.isAxiosError(err)) {
    console.error(context, err.response?.data || err.message);
    return;
  }
  console.error(context, err);
};

const getAxiosStatus = (err, fallback = 500) => {
  if (!axios.isAxiosError(err)) return fallback;
  if (err.code === 'ECONNABORTED') return 504;
  if (!err.response?.status) return fallback;
  return err.response.status >= 500 ? 502 : err.response.status;
};

const sendProxyError = (res, context, err, fallbackStatus = 500) => {
  logAxiosError(context, err);
  const status = getAxiosStatus(err, fallbackStatus);
  const details = axios.isAxiosError(err) ? err.response?.data || err.message : String(err);
  res.status(status).json({ error: context, details });
};

const buildFrontendRedirectUrl = (state) => {
  const requestedRedirect = typeof state === 'string' && state.trim().length > 0 ? state : DEFAULT_FRONTEND_REDIRECT;

  try {
    return new URL(requestedRedirect);
  } catch {
    return new URL(DEFAULT_FRONTEND_REDIRECT);
  }
};

const authorizeHandler = (req, res) => {
  if (!hasOAuthConfig()) {
    return res.status(500).json({ error: 'Missing STRAVA oauth config in backend environment' });
  }

  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    redirect_uri: process.env.STRAVA_REDIRECT_URI,
    response_type: 'code',
    scope: 'activity:read_all,profile:read_all',
    state: typeof req.query.redirect_uri === 'string' ? req.query.redirect_uri : DEFAULT_FRONTEND_REDIRECT,
  });

  const redirectUrl = `${STRAVA_BASE_URL}/oauth/authorize?${params.toString()}`;
  res.redirect(redirectUrl);
};

const exchangeTokenHandler = async (req, res) => {
  if (!hasOAuthConfig()) {
    return res.status(500).json({ error: 'Missing STRAVA oauth config in backend environment' });
  }

  const code = typeof req.query.code === 'string' ? req.query.code : null;
  const state = typeof req.query.state === 'string' ? req.query.state : undefined;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    const response = await stravaClient.post('/oauth/token', null, {
      params: {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      },
    });

    const { access_token, refresh_token, expires_at, athlete } = response.data;
    if (!refresh_token) {
      return res.status(500).json({ error: 'Did not receive refresh_token from Strava during initial auth' });
    }

    const redirectUrl = buildFrontendRedirectUrl(state);
    redirectUrl.searchParams.set('access_token', access_token);
    redirectUrl.searchParams.set('refresh_token', refresh_token);
    redirectUrl.searchParams.set('expires_at', String(expires_at));
    redirectUrl.searchParams.set('athlete_id', String(athlete?.id || ''));

    res.redirect(redirectUrl.toString());
  } catch (err) {
    sendProxyError(res, 'Error exchanging token', err);
  }
};

const requireAccessToken = (req, res) => {
  const token = typeof req.query.access_token === 'string' ? req.query.access_token : null;
  if (!token) {
    res.status(400).json({ error: 'Missing access_token' });
    return null;
  }
  return token;
};

const bearerHeaders = (accessToken) => ({ Authorization: `Bearer ${accessToken}` });

app.get(['/api/authorize', '/authorize'], authorizeHandler);
app.get(['/api/exchange_token', '/exchange_token'], exchangeTokenHandler);

app.post('/api/refresh_token', async (req, res) => {
  const refreshToken = typeof req.body?.refresh_token === 'string' ? req.body.refresh_token : null;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Missing refresh_token' });
  }

  try {
    const response = await stravaClient.post('/oauth/token', null, {
      params: {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
    });

    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_at: response.data.expires_at,
    });
  } catch (err) {
    sendProxyError(res, 'Failed to refresh token', err, 401);
  }
});

app.get('/api/activities', async (req, res) => {
  const accessToken = requireAccessToken(req, res);
  if (!accessToken) return;

  try {
    const response = await stravaClient.get('/api/v3/athlete/activities', {
      headers: bearerHeaders(accessToken),
    });
    res.json(response.data);
  } catch (err) {
    sendProxyError(res, 'Error in /api/activities', err);
  }
});

app.get('/api/athlete_stats', async (req, res) => {
  const accessToken = requireAccessToken(req, res);
  const athleteId = typeof req.query.athlete_id === 'string' ? req.query.athlete_id : null;

  if (!accessToken || !athleteId) {
    return res.status(400).json({ error: 'Missing access_token or athlete_id' });
  }

  try {
    const response = await stravaClient.get(`/api/v3/athletes/${athleteId}/stats`, {
      headers: bearerHeaders(accessToken),
    });
    res.json(response.data);
  } catch (err) {
    sendProxyError(res, 'Error in /api/athlete_stats', err);
  }
});

app.get('/api/athlete', async (req, res) => {
  const accessToken = requireAccessToken(req, res);
  if (!accessToken) return;

  try {
    const response = await stravaClient.get('/api/v3/athlete', {
      headers: bearerHeaders(accessToken),
    });
    res.json(response.data);
  } catch (err) {
    sendProxyError(res, 'Error in /api/athlete', err);
  }
});

app.get('/api/gear/:gearId', async (req, res) => {
  const accessToken = requireAccessToken(req, res);
  const gearId = req.params.gearId;
  if (!accessToken) return;

  try {
    const response = await stravaClient.get(`/api/v3/gear/${gearId}`, {
      headers: bearerHeaders(accessToken),
    });
    res.json(response.data);
  } catch (err) {
    sendProxyError(res, `Error in /api/gear/${gearId}`, err);
  }
});

app.get('/healthz', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
