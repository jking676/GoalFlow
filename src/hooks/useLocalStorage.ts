import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'goalflow-data-v1';

export function useLocalStorage<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // ignore
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  const update = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => (typeof value === 'function' ? (value as (prev: T) => T)(prev) : value));
  }, []);

  return [state, update];
}

export function getStorageKey(): string {
  return STORAGE_KEY;
}
