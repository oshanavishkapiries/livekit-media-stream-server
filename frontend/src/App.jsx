import { useMemo, useState } from 'react';
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from '@livekit/components-react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function App() {
  const [identity, setIdentity] = useState('doctor@example.com');
  const [roomName, setRoomName] = useState('telehealth-demo');
  const [displayName, setDisplayName] = useState('Dr. Smith');
  const [livekitUrl, setLivekitUrl] = useState(import.meta.env.VITE_LIVEKIT_URL || '');
  const [token, setToken] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  async function handleJoin(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/getToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity,
          roomName,
          name: displayName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch token.');
      }

      setToken(data.token);
      setLivekitUrl(data.url);
      setConnected(true);
    } catch (err) {
      setError(err.message);
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
          onDisconnected={() => setConnected(false)}
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
        <p className="eyebrow">Telehealth POC</p>
        <h1>Join a secure LiveKit consultation room</h1>
        <p className="lede">
          This client asks the backend for a short-lived token, then connects directly to the external LiveKit server.
        </p>

        <form className="form" onSubmit={handleJoin}>
          <label>
            Identity
            <input value={identity} onChange={(e) => setIdentity(e.target.value)} required />
          </label>

          <label>
            Display name
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </label>

          <label>
            Room name
            <input value={roomName} onChange={(e) => setRoomName(e.target.value)} required />
          </label>

          <label>
            LiveKit URL override
            <input
              value={livekitUrl}
              onChange={(e) => setLivekitUrl(e.target.value)}
              placeholder="wss://livekit.example.com"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Connecting...' : 'Request token and join'}
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}
      </section>
    </main>
  );
}
