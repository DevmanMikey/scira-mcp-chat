import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

/**
 * Custom hook for persistent localStorage state with SSR support
 * @param key The localStorage key
 * @param initialValue The initial value if no value exists in localStorage
 * @returns A stateful value and a function to update it
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Check if we're in the browser environment and localStorage is available
  const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

  // Initialize state from localStorage synchronously if in browser
  const getInitialValue = (): T => {
    if (!isBrowser) return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return parseJSON(item);
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    return initialValue;
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(getInitialValue);

  // Handle hydration mismatch by updating state after mount if needed
  useEffect(() => {
    if (!isBrowser) return;

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsedValue = parseJSON(item) as T;
        // Only update if the value is different to avoid unnecessary re-renders
        if (JSON.stringify(parsedValue) !== JSON.stringify(storedValue)) {
          setStoredValue(parsedValue);
        }
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key, isBrowser, storedValue]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback((value: SetValue<T>) => {
    if (!isBrowser) return;

    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to localStorage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, isBrowser]);

  return [storedValue, setValue] as const;
}

// Helper function to parse JSON with error handling
function parseJSON<T>(value: string): T {
  try {
    return JSON.parse(value);
  } catch {
    console.error('Error parsing JSON from localStorage');
    return {} as T;
  }
}

/**
 * A hook to get a value from localStorage (read-only) with SSR support
 * @param key The localStorage key
 * @param defaultValue The default value if the key doesn't exist
 * @returns The value from localStorage or the default value
 */
export function useLocalStorageValue<T>(key: string, defaultValue: T): T {
  const [value] = useLocalStorage<T>(key, defaultValue);
  return value;
} 