import { useEffect, useState } from 'react';

const DATA_FILES = ['listings', 'sundown', 'routes'];

async function fetchJson(name) {
  const response = await fetch(`${import.meta.env.BASE_URL}data/${name}.json`);
  if (!response.ok) throw new Error(`Could not load ${name}.json (HTTP ${response.status})`);
  return response.json();
}

/** Loads the three static data files once. Returns { status, data, error }. */
export function useDataset() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    Promise.all(DATA_FILES.map(fetchJson))
      .then(([listings, sundown, routes]) => {
        if (!cancelled) setState({ status: 'ready', data: { listings, sundown, routes }, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', data: null, error });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
