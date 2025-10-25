import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export const useLoadingState = (initialState: LoadingState = { isLoading: false }) => {
  const [state, setState] = useState<LoadingState>(initialState);

  const setLoading = useCallback((loading: boolean, message?: string) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
      message: loading ? message : undefined,
      progress: loading ? 0 : undefined
    }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({
      ...prev,
      progress
    }));
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false });
  }, []);

  return {
    ...state,
    setLoading,
    setProgress,
    reset
  };
};