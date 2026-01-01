import { useState, useEffect } from 'react';

export function usePersistentState<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(`hr-${key}`);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "hr-${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(`hr-${key}`, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "hr-${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}