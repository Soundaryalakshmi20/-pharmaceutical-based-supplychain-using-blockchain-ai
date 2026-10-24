import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Data-fetching hook used by the existing pages:
 *
 *   const { data, loading, error, execute } = useApi(() => getPatients());
 *   const { data: medicines } = useApi(getMedicines);
 *
 * `execute` re-runs the same call (used as "refresh").
 */
export function useApi(fn, { immediate = true, args = [] } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(immediate));
  const [error, setError] = useState(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const execute = useCallback(async (...extra) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current(...extra);
      if (mounted.current) setData(result);
      return result;
    } catch (err) {
      if (mounted.current) setError(err);
      return null;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, immediate, ...args]);

  return { data, loading, error, execute, setData };
}

export default useApi;
