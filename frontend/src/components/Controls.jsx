export default function Controls({
  micEnabled,
  cameraEnabled,
  onToggleMic,
  onToggleCamera,
  onLeave,
  roomName,
}) {
  async function copyRoomName() {
    try {
      await navigator.clipboard.writeText(roomName);
    } catch {
      const el = document.createElement("input");
      el.value = roomName;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  }

  return (
    <div className="controls">
      <button
        className={`btn btn-control ${!micEnabled ? "btn-off" : ""}`}
        onClick={onToggleMic}
      >
        {micEnabled ? "Mic On" : "Mic Off"}
      </button>

      <button
        className={`btn btn-control ${!cameraEnabled ? "btn-off" : ""}`}
        onClick={onToggleCamera}
      >
        {cameraEnabled ? "Camera On" : "Camera Off"}
      </button>

      <button className="btn btn-control" onClick={copyRoomName}>
        Copy Room
      </button>

      <button className="btn btn-danger" onClick={onLeave}>
        Leave Room
      </button>
    </div>
  );
}
