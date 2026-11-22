import { useEffect, useState } from 'react';
import type { PortfolioData } from '../types/academic';

interface UsePortfolioDataResult {
  data: PortfolioData | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function usePortfolioData(): UsePortfolioDataResult {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetch('./data/profiles.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Unable to load academic profile data (HTTP ${res.status})`);
        }
        return res.json() as Promise<PortfolioData>;
      })
      .then((json) => {
        if (!active) return;
        setData(json);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        const message =
          err instanceof Error ? err.message : 'Failed to load profiles.json';
        setError(message);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [version]);

  return {
    data,
    loading,
    error,
    reload: () => setVersion((v) => v + 1),
  };
}
