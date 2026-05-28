import { useMemo, useState } from 'react';
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from '@livekit/components-react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function createIdentity(role, email) {
  const emailHandle = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${role}-${emailHandle}-${suffix}`;
}

export default function App() {
  const [displayName, setDisplayName] = useState('Dr. Smith');
  const [email, setEmail] = useState('doctor@example.com');
  const [role, setRole] = useState('doctor');
  const [session, setSession] = useState(null);
  const [roomName, setRoomName] = useState('telehealth-demo');
  const [livekitUrl, setLivekitUrl] = useState(import.meta.env.VITE_LIVEKIT_URL || '');
  const [token, setToken] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Ready');
  const [loading, setLoading] = useState(false);
  const [lastRequestId, setLastRequestId] = useState('');
  const [lastIdentity, setLastIdentity] = useState('');

  const roomOptions = useMemo(
    () => ({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: {
          width: 1280,
          height: 720,
        },
      },
    }),
    []
  );

  function handleLogin(event) {
    event.preventDefault();
    setError('');

    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      setError('Display name and email are required to continue.');
      return;
    }

    setSession({
      displayName: trimmedName,
      email: trimmedEmail,
      role,
    });

    setStatus(`Signed in as ${trimmedName}`);
  }

  async function handleJoin(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    setStatus('Requesting secure token...');

    try {
      if (!session) {
        throw new Error('Please sign in first.');
      }

      const identity = createIdentity(session.role, session.email);
      const response = await fetch(`${backendUrl}/getToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity,
          roomName,
          name: session.displayName,
          role: session.role,
        }),
      });

      const raw = await response.text();
      let data = {};

      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Backend returned an invalid response.');
        }
      }

      if (!response.ok) {
        throw new Error(data.error || `Token request failed with status ${response.status}.`);
      }

      setToken(data.token);
      setLivekitUrl(data.url);
      setLastRequestId(data.requestId || 'n/a');
      setLastIdentity(identity);
      setStatus('Token received. Joining room...');
      setConnected(true);
    } catch (err) {
      setError(err.message);
      setStatus('Failed to join. Review details and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (connected && token && livekitUrl) {
    return (
      <main className="room-shell">
        <LiveKitRoom
          token={token}
          serverUrl={livekitUrl}
          connect={true}
          audio={true}
          video={true}
          options={roomOptions}
          onConnected={() => setStatus('Connected to consultation room.')}
          onDisconnected={() => {
            setConnected(false);
            setStatus('Disconnected from room.');
          }}
          onError={(err) => {
            setError(err?.message || 'LiveKit connection error.');
            setStatus('Room connection error.');
          }}
        >
          <RoomAudioRenderer />
          <VideoConference />
        </LiveKitRoom>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="panel">
        <div className="hero">
          <p className="eyebrow">Telehealth Workspace</p>
          <h1>Secure consultation room with better diagnostics</h1>
          <p className="lede">
            Sign in, request a room token, and connect to LiveKit. Each participant now gets a unique identity to avoid
            session collisions.
          </p>
        </div>

        {!session ? (
          <form className="form" onSubmit={handleLogin}>
            <h2>Sign in</h2>
            <label>
              Display name
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </label>

            <label>
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" />
            </label>

            <label>
              Role
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
                <option value="observer">Observer</option>
              </select>
            </label>

            <button type="submit">Continue to room setup</button>
          </form>
        ) : (
          <form className="form" onSubmit={handleJoin}>
            <h2>Room setup</h2>
            <p className="hint">Signed in as {session.displayName}</p>

            <label>
              Room name
              <input value={roomName} onChange={(e) => setRoomName(e.target.value)} required />
            </label>

            <label>
              LiveKit URL override
              <input value={livekitUrl} onChange={(e) => setLivekitUrl(e.target.value)} placeholder="ws://localhost:7880" />
            </label>

            <div className="button-row">
              <button type="submit" disabled={loading}>
                {loading ? 'Connecting...' : 'Request token and join'}
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setSession(null);
                  setStatus('Signed out.');
                }}
              >
                Switch account
              </button>
            </div>
          </form>
        )}

        <section className="status-panel" aria-live="polite">
          <h3>Connection status</h3>
          <p>{status}</p>
          {lastIdentity ? <p className="meta">Identity: {lastIdentity}</p> : null}
          {lastRequestId ? <p className="meta">Request ID: {lastRequestId}</p> : null}
          {error ? <p className="error">{error}</p> : null}
        </section>
      </section>
    </main>
  );
}
