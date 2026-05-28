const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { AccessToken } = require('livekit-server-sdk');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const rootLogsDir = path.resolve(__dirname, '..', 'logs');
const logFilePath = process.env.LOG_FILE_PATH || path.join(rootLogsDir, 'backend.log');

const livekitUrl = process.env.LIVEKIT_URL;
const livekitApiKey = process.env.LIVEKIT_API_KEY;
const livekitApiSecret = process.env.LIVEKIT_API_SECRET;

fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

function writeLog(level, event, meta = {}) {
  const record = {
    ts: new Date().toISOString(),
    level,
    event,
    ...meta,
  };

  const line = `${JSON.stringify(record)}\n`;

  fs.appendFile(logFilePath, line, (error) => {
    if (error) {
      console.error('Failed to write log file:', error.message);
    }
  });
}

function safeError(error) {
  if (!error) {
    return { message: 'Unknown error' };
  }

  return {
    message: error.message,
    name: error.name,
    stack: error.stack,
  };
}

app.use(cors({ origin: true }));
app.use(express.json());

app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  const start = Date.now();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    writeLog('info', 'http_request', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip,
      userAgent: req.get('user-agent') || 'unknown',
    });
  });

  next();
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/getToken', async (req, res) => {
  try {
    const { identity, roomName, name, role } = req.body || {};
    const normalizedIdentity = typeof identity === 'string' ? identity.trim() : '';
    const normalizedRoomName = typeof roomName === 'string' ? roomName.trim() : '';
    const normalizedName = typeof name === 'string' ? name.trim() : '';

    if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
      writeLog('error', 'missing_livekit_env', {
        requestId: req.requestId,
      });

      return res.status(500).json({
        error: 'LiveKit environment variables are not configured.',
        requestId: req.requestId,
      });
    }

    if (!normalizedIdentity || !normalizedRoomName) {
      return res.status(400).json({
        error: 'identity and roomName are required.',
        requestId: req.requestId,
      });
    }

    if (normalizedIdentity.length > 128 || normalizedRoomName.length > 128) {
      return res.status(400).json({
        error: 'identity and roomName must be <= 128 characters.',
        requestId: req.requestId,
      });
    }

    writeLog('info', 'token_request_received', {
      requestId: req.requestId,
      identity: normalizedIdentity,
      roomName: normalizedRoomName,
      role: role || 'unspecified',
    });

    const token = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: normalizedIdentity,
      name: normalizedName || normalizedIdentity,
    });

    token.addGrant({
      roomJoin: true,
      room: normalizedRoomName,
    });

    const jwt = await token.toJwt();

    writeLog('info', 'token_generated', {
      requestId: req.requestId,
      identity: normalizedIdentity,
      roomName: normalizedRoomName,
    });

    res.json({
      token: jwt,
      url: livekitUrl,
      roomName: normalizedRoomName,
      identity: normalizedIdentity,
      requestId: req.requestId,
    });
  } catch (error) {
    writeLog('error', 'token_generation_failed', {
      requestId: req.requestId,
      error: safeError(error),
    });

    console.error('Failed to generate token:', error);
    res.status(500).json({
      error: 'Failed to generate token.',
      requestId: req.requestId,
    });
  }
});

app.listen(port, () => {
  writeLog('info', 'backend_started', {
    port,
    logFilePath,
  });

  console.log(`Backend listening on http://localhost:${port}`);
});
