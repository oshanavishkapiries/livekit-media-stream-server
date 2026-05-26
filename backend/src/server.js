import express from "express";
import cors from "cors";
import { AccessToken } from "livekit-server-sdk";

const app = express();
app.use(cors());
app.use(express.json());

const {
  LIVEKIT_URL = "ws://localhost:7880",
  LIVEKIT_API_KEY = "devkey",
  LIVEKIT_API_SECRET = "secret",
  PORT = "3001",
} = process.env;

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    livekit: { url: LIVEKIT_URL },
    timestamp: new Date().toISOString(),
  });
});

app.post("/livekit/token", async (req, res) => {
  const { roomName, participantName, participantRole } = req.body;

  if (!roomName) {
    return res.status(400).json({ error: "roomName is required" });
  }
  if (!participantName) {
    return res.status(400).json({ error: "participantName is required" });
  }

  try {
    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantName,
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    res.json({
      accessToken: jwt,
      roomUrl: LIVEKIT_URL,
      roomName,
      participantName,
      participantRole: participantRole || "client",
    });
  } catch (err) {
    console.error("Token generation failed:", err);
    res.status(500).json({ error: "Failed to generate access token" });
  }
});

app.listen(Number(PORT), () => {
  console.log(`Hitha backend running on http://localhost:${PORT}`);
  console.log(`LiveKit URL: ${LIVEKIT_URL}`);
});
