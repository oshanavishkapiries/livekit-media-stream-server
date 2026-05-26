import { useState } from "react";

export default function JoinForm({ onJoin, error, loading }) {
  const [participantName, setParticipantName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [missingFields, setMissingFields] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!participantName.trim()) {
      setMissingFields("Participant name is required");
      return;
    }
    if (!roomName.trim()) {
      setMissingFields("Room name is required");
      return;
    }
    setMissingFields("");
    onJoin({
      participantName: participantName.trim(),
      roomName: roomName.trim(),
      participantRole: "client",
    });
  }

  function quickJoin(role) {
    if (!participantName.trim()) {
      setMissingFields("Participant name is required");
      return;
    }
    if (!roomName.trim()) {
      setMissingFields("Room name is required");
      return;
    }
    setMissingFields("");
    onJoin({
      participantName: `${participantName.trim()} (${role})`,
      roomName: roomName.trim(),
      participantRole: role.toLowerCase(),
    });
  }

  const disabled = loading || !participantName.trim() || !roomName.trim();

  return (
    <div className="join-form">
      <h1>Hitha Video Call</h1>
      <p className="subtitle">LiveKit POC — Join a room to test video & voice</p>

      {(error || missingFields) && (
        <div className="error-banner">{missingFields || error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <label>
          Your Name
          <input
            type="text"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Enter your name"
            autoFocus
          />
        </label>

        <label>
          Room Name
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
          />
        </label>

        <div className="button-group">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => quickJoin("Therapist")}
            disabled={disabled}
          >
            Join as Therapist
          </button>
          <button type="submit" className="btn btn-primary" disabled={disabled}>
            {loading ? "Connecting..." : "Join as Client"}
          </button>
        </div>
      </form>
    </div>
  );
}
