import { useState, useEffect, useRef } from 'react';

export function useFetch<T = any>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    controllerRef.current = abortController;

    setLoading(true);
    fetch(url, { signal: abortController.signal })
      .then(response => response.json())
      .then(data => setData(data.results ?? data))
      .catch(err => {
        if (err.name === 'AbortError') {
          setError("Petición abortada");
        } else {
          setError("Error al cargar los datos: " + err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => abortController.abort();
  }, [url]);

  const handleCancelRequest = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      setError("Petición cancelada por el usuario");
      setLoading(false);
    }
  };

  return { data, loading, error, handleCancelRequest };
}
