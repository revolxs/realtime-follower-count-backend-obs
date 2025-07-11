import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS for OBS overlays
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get('/api/twitch/:user', async (req, res) => {
  const { user } = req.params;
  const token = await getTwitchToken();

  const userData = await fetch(`https://api.twitch.tv/helix/users?login=${user}`, {
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`
    }
  });

  const userId = (await userData.json()).data?.[0]?.id;
  const followerRes = await fetch(`https://api.twitch.tv/helix/users/follows?to_id=${userId}`, {
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await followerRes.json();
  res.json({ followers: data.total });
});

async function getTwitchToken() {
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
  });
  const json = await res.json();
  return json.access_token;
}

// Other platform routes (mocked)
app.get('/api/youtube/:id', async (req, res) => {
  res.json({ followers: 1000 }); // Replace with YouTube Data API logic
});

app.get('/api/kick/:id', async (req, res) => {
  res.json({ followers: 456 }); // Placeholder, Kick API unsupported officially
});

app.get('/api/tiktok/:id', async (req, res) => {
  res.json({ followers: 789 }); // Placeholder, TikTok API is unofficial
});

app.get('/api/x/:id', async (req, res) => {
  res.json({ followers: 321 }); // Placeholder, Twitter API requires auth
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));