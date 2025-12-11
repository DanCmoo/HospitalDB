import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiOptions {
  autoFetch?: boolean;
}

export function useApi<T>(
  apiFn: () => Promise<T>,
  options: UseApiOptions = { autoFetch: true }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetch = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const result = await apiFn();
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
    }
  }, [apiFn]);

  useEffect(() => {
    if (options.autoFetch) {
      fetch();
    }
  }, [options.autoFetch, fetch]);

  return { ...state, refetch: fetch };
}
