import { useState, useCallback } from "react";
import JoinForm from "./components/JoinForm.jsx";
import RoomView from "./components/RoomView.jsx";
import { useToken } from "./hooks/useToken.js";

export default function App() {
  const [inCall, setInCall] = useState(false);
  const [params, setParams] = useState(null);
  const { token, tokenData, error, loading, getToken } = useToken();

  const handleJoin = useCallback(
    async (p) => {
      setParams(p);
      await getToken(p);
    },
    [getToken]
  );

  const handleLeave = useCallback(() => {
    setInCall(false);
    setParams(null);
  }, []);

  // Once token is received, enter the room
  if (token && tokenData && params && !inCall) {
    // Small delay to avoid React batching issues
    setTimeout(() => setInCall(true), 0);
  }

  if (inCall && token && tokenData) {
    return <RoomView tokenData={tokenData} onLeave={handleLeave} />;
  }

  return <JoinForm onJoin={handleJoin} error={error} loading={loading} />;
}
