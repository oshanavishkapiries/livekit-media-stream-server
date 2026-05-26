import { useState, useCallback } from "react";
import { fetchToken } from "../lib/api.js";

export function useToken() {
  const [token, setToken] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getToken = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchToken(params);
      setToken(data.accessToken);
      setTokenData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { token, tokenData, error, loading, getToken };
}
