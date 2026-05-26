import { useEffect, useState, useRef, useCallback } from "react";
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  Track,
  LocalTrackPublication,
} from "livekit-client";
import Controls from "./Controls.jsx";

export default function RoomView({ tokenData, onLeave }) {
  const [room, setRoom] = useState(null);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [mediaAvailable, setMediaAvailable] = useState(true);
  const localVideoRef = useRef(null);

  const updateRemoteParticipants = useCallback((r) => {
    const participants = Array.from(r.remoteParticipants.values()).map((p) => ({
      sid: p.sid,
      name: p.identity || p.name || "Unknown",
      tracks: new Map(p.videoTrackPublications),
    }));
    setRemoteParticipants(participants);
  }, []);

  useEffect(() => {
    if (!tokenData) return;

    const roomInstance = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    roomInstance.on(RoomEvent.ConnectionStateChanged, (state) => {
      setConnectionState(state);
    });

    roomInstance.on(RoomEvent.RemoteTrackPublished, (pub) => {
      if (pub.kind === Track.Kind.Video || pub.kind === Track.Kind.Audio) {
        pub.setSubscribed(true);
      }
    });

    const handleParticipantChange = () => {
      updateRemoteParticipants(roomInstance);
    };

    roomInstance
      .on(RoomEvent.ParticipantConnected, handleParticipantChange)
      .on(RoomEvent.ParticipantDisconnected, handleParticipantChange)
      .on(RoomEvent.TrackSubscribed, handleParticipantChange)
      .on(RoomEvent.TrackUnsubscribed, handleParticipantChange);

    roomInstance.on(RoomEvent.Disconnected, (reason) => {
      if (reason?.message?.includes("401")) {
        setError("Invalid credentials — check LiveKit API key/secret");
      }
    });

    async function connect() {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (mediaErr) {
        if (
          mediaErr.name === "NotAllowedError" ||
          mediaErr.name === "PermissionDeniedError"
        ) {
          setError(
            "Camera/microphone permission denied. Please allow access in your browser settings."
          );
          setMediaAvailable(false);
        } else if (
          mediaErr.name === "NotFoundError" ||
          mediaErr.name === "DevicesNotFoundError"
        ) {
          setMediaAvailable(false);
          setError("No camera or microphone found.");
        } else {
          setError(`Media error: ${mediaErr.message}`);
          setMediaAvailable(false);
        }
        return;
      }

      try {
        await roomInstance.connect(tokenData.roomUrl, tokenData.accessToken);

        await roomInstance.localParticipant.publishTrack(
          stream.getVideoTracks()[0],
          { name: "camera", source: Track.Source.Camera }
        );
        await roomInstance.localParticipant.publishTrack(
          stream.getAudioTracks()[0],
          { name: "microphone", source: Track.Source.Microphone }
        );

        setRoom(roomInstance);
        updateRemoteParticipants(roomInstance);
      } catch (connErr) {
        if (connErr.message?.includes("401") || connErr.message?.includes("auth")) {
          setError(
            "Invalid LiveKit credentials. Check LIVEKIT_API_KEY and LIVEKIT_API_SECRET."
          );
        } else if (connErr.message?.includes("ECONNREFUSED")) {
          setError("Cannot connect to LiveKit server. Is it running?");
        } else {
          setError(`Connection failed: ${connErr.message}`);
        }
        stream.getTracks().forEach((t) => t.stop());
      }
    }

    connect();

    return () => {
      roomInstance.disconnect();
    };
  }, [tokenData, updateRemoteParticipants]);

  const toggleMic = useCallback(() => {
    if (!room) return;
    const pub = room.localParticipant.getTrackPublication(Track.Source.Microphone);
    if (pub) {
      const muted = !pub.isMuted;
      pub.track?.enable(!muted);
      setMicEnabled(!muted);
    }
  }, [room]);

  const toggleCamera = useCallback(() => {
    if (!room) return;
    const pub = room.localParticipant.getTrackPublication(Track.Source.Camera);
    if (pub) {
      const muted = !pub.isMuted;
      pub.track?.enable(!muted);
      setCameraEnabled(!muted);
    }
  }, [room]);

  const handleLeave = useCallback(() => {
    room?.disconnect();
    onLeave();
  }, [room, onLeave]);

  useEffect(() => {
    if (!room) return;
    const pub = room.localParticipant.getTrackPublication(Track.Source.Camera);
    const videoTrack = pub?.track?.mediaStreamTrack;
    if (!videoTrack) return;
    const stream = new MediaStream([videoTrack]);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }, [room, cameraEnabled]);

  const stateLabel =
    connectionState === "connected"
      ? "Connected"
      : connectionState === "connecting"
        ? "Connecting..."
        : connectionState;

  return (
    <div className="room-view">
      <div className="room-header">
        <div>
          <h2>Room: {tokenData.roomName}</h2>
          <span className={`connection-state state-${connectionState}`}>
            {stateLabel}
          </span>
        </div>
        <span className="participant-name">{tokenData.participantName}</span>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!mediaAvailable && connectionState !== "connected" && (
        <div className="warning-banner">
          No camera/microphone available. You can still view the room.
        </div>
      )}

      <div className="video-grid">
        <div className="video-tile local-tile">
          <video ref={localVideoRef} autoPlay playsInline muted />
          <span className="tile-label">You ({tokenData.participantName})</span>
          {!cameraEnabled && (
            <div className="camera-off-overlay">Camera Off</div>
          )}
        </div>

        {remoteParticipants.map((p) => (
          <RemoteVideo key={p.sid} participant={p} />
        ))}

        {remoteParticipants.length === 0 && connectionState === "connected" && (
          <div className="empty-room">
            <p>Waiting for others to join...</p>
            <p className="room-name-hint">
              Room: <strong>{tokenData.roomName}</strong>
            </p>
          </div>
        )}
      </div>

      <Controls
        micEnabled={micEnabled}
        cameraEnabled={cameraEnabled}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onLeave={handleLeave}
        roomName={tokenData.roomName}
      />
    </div>
  );
}

function RemoteVideo({ participant }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const pubs = Array.from(participant.tracks.values());
    for (const pub of pubs) {
      if (pub.kind === Track.Kind.Video && pub.track) {
        const stream = new MediaStream([pub.track.mediaStreamTrack]);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    }
  }, [participant.tracks]);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="video-tile remote-tile">
      <video ref={videoRef} autoPlay playsInline />
      <span className="tile-label">{participant.name}</span>
    </div>
  );
}
