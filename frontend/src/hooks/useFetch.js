import { useEffect, useState } from 'react';
import api from '../lib/api.js';

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    api
      .get(url, options)
      .then((response) => {
        if (!active) return;
        setData(response.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [url]);

  return { data, loading, error };
}
