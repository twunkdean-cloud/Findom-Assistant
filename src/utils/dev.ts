export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

export const devLog = (message: string, data?: any) => {
  if (isDevelopment) {
    console.log(`[DEV] ${message}`, data);
  }
};

export const devError = (message: string, error?: any) => {
  if (isDevelopment) {
    console.error(`[DEV ERROR] ${message}`, error);
  }
};

export const devWarn = (message: string, data?: any) => {
  if (isDevelopment) {
    console.warn(`[DEV WARN] ${message}`, data);
  }
};