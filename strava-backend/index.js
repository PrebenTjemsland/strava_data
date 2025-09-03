require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());


app.get('/authorize', (req, res) => {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'activity:read_all,profile:read_all'
  });
  const redirectUrl = `https://www.strava.com/oauth/authorize?${params}`;
  console.log('Redirecting to:', redirectUrl);
  res.redirect(redirectUrl);
});

app.get('/exchange_token', async (req, res) => {
  const { code } = req.query;
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
res.redirect(`http://localhost:5173/?access_token=${access_token}&athlete_id=${athlete.id}`);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.get('/activities', async (req, res) => {
  const { access_token } = req.query;
  if (!access_token) {
    return res.status(400).json({ error: 'Missing access_token' });
  }
  try {
    const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.get('/athlete_stats', async (req, res) => {
  const { access_token, athlete_id } = req.query;
  if (!access_token || !athlete_id) {
    return res.status(400).json({ error: 'Missing access_token or athlete_id' });
  }
  try {
    const response = await axios.get(`https://www.strava.com/api/v3/athletes/${athlete_id}/stats`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(5050, () => console.log('Backend running on http://localhost:5050'));
