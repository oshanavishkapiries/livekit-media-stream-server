const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { AccessToken, VideoGrant } = require('livekit-server-sdk');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const livekitUrl = process.env.LIVEKIT_URL;
const livekitApiKey = process.env.LIVEKIT_API_KEY;
const livekitApiSecret = process.env.LIVEKIT_API_SECRET;

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/getToken', async (req, res) => {
  try {
    const { identity, roomName, name } = req.body || {};

    if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
      return res.status(500).json({ error: 'LiveKit environment variables are not configured.' });
    }

    if (!identity || !roomName) {
      return res.status(400).json({ error: 'identity and roomName are required.' });
    }

    // The token is scoped tightly to one room for this POC.
    const token = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity,
      name: name || identity,
    });

    token.addGrant(
      new VideoGrant({
        roomJoin: true,
        room: roomName,
      })
    );

    const jwt = await token.toJwt();

    res.json({
      token: jwt,
      url: livekitUrl,
      roomName,
      identity,
    });
  } catch (error) {
    console.error('Failed to generate token:', error);
    res.status(500).json({ error: 'Failed to generate token.' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
