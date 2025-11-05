require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


app.get('/api/authorize', (req, res) => {
  console.log('Authorize endpoint called. Query:', req.query);
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  
  const frontendRedirect = req.query.redirect_uri;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'activity:read_all,profile:read_all',
    state: frontendRedirect 
  });
  
  const redirectUrl = `https://www.strava.com/oauth/authorize?${params}`;
  console.log('Redirecting to:', redirectUrl);
  res.redirect(redirectUrl);
});

app.get('/api/exchange_token', async (req, res) => {
  const { code, state } = req.query;
  console.log('Exchange token endpoint called. Query:', req.query);
  try {
    const response = await axios.post('https://www.strava.com/oauth/token', null, {
      params: {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code'
      }
    });
    const { access_token, athlete } = response.data;
    const frontendRedirect = state ? decodeURIComponent(state) : 'http://localhost:5173';
    console.log('Token exchange success. Redirecting to:', `${frontendRedirect}?access_token=${access_token}&athlete_id=${athlete.id}`);
    res.redirect(`${frontendRedirect}?access_token=${access_token}&athlete_id=${athlete.id}`);
  } catch (err) {
    console.error('Error in /exchange_token:', err);
    res.status(500).json({ error: err.toString(), details: err?.response?.data || null });
  }
});

app.get('/api/activities', async (req, res) => {
  const { access_token } = req.query;
  console.log('/activities called. Query:', req.query);
  if (!access_token) {
    console.warn('Missing access_token in /activities');
    return res.status(400).json({ error: 'Missing access_token' });
  }
  try {
    const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    res.json(response.data);
  } catch (err) {
    console.error('Error in /activities:', err);
    res.status(500).json({ error: err.toString(), details: err?.response?.data || null });
  }
});

app.get('/api/athlete_stats', async (req, res) => {
  const { access_token, athlete_id } = req.query;
  console.log('/athlete_stats called. Query:', req.query);
  if (!access_token || !athlete_id) {
    console.warn('Missing access_token or athlete_id in /athlete_stats');
    return res.status(400).json({ error: 'Missing access_token or athlete_id' });
  }
  try {
    const response = await axios.get(`https://www.strava.com/api/v3/athletes/${athlete_id}/stats`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    res.json(response.data);
  } catch (err) {
    console.error('Error in /athlete_stats:', err);
    res.status(500).json({ error: err.toString(), details: err?.response?.data || null });
  }
});

app.get('/api/athlete', async (req, res) => {
  console.log('here');
  
  const { access_token } = req.query;
  console.log('/athlete called. Query:', req.query);
  if (!access_token) {
    console.warn('Missing access_token in /athlete');
    return res.status(400).json({ error: 'Missing access_token' });
  }
  try {
    const response = await axios.get('https://www.strava.com/api/v3/athlete', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    res.json(response.data);
  } catch (err) {
    console.error('Error in /athlete:', err);
    res.status(500).json({ error: err.toString(), details: err?.response?.data || null });
  }
});

app.get('/api/gear/:gearId', async (req, res) => {
  const { access_token } = req.query;
  const { gearId } = req.params;
  console.log(`/gear/${gearId} called. Query:`, req.query);
  if (!access_token) {
    console.warn('Missing access_token in /gear/:gearId');
    return res.status(400).json({ error: 'Missing access_token' });
  }
  try {
    const response = await axios.get(`https://www.strava.com/api/v3/gear/${gearId}`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    res.json(response.data);
  } catch (err) {
    console.error(`Error in /gear/${gearId}:`, err);
    res.status(500).json({ error: err.toString(), details: err?.response?.data || null });
  }
});

app.listen(5050, () => console.log('Backend running on http://localhost:5050'));
