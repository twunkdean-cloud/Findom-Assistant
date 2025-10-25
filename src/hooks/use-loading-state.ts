import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export const useLoadingState = () => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null });
  }, []);

  return {
    ...state,
    setLoading,
    setError,
    clearError,
    reset,
  };
};