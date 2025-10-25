// Development utilities
export const isDev = () => process.env.NODE_ENV === 'development';

export const devLog = (message: string, data?: any) => {
  if (isDev()) {
    console.log(`[DEV] ${message}`, data);
  }
};

export const devError = (message: string, error?: any) => {
  if (isDev()) {
    console.error(`[DEV ERROR] ${message}`, error);
  }
};

// Performance monitoring in development
export const measurePerformance = (name: string, fn: () => void) => {
  if (isDev()) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`[PERF] ${name}: ${end - start}ms`);
  } else {
    fn();
  }
};