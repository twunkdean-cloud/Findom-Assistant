export const isDevelopment = process.env.NODE_ENV === 'development';

export const devLog = (message: string, data?: any) => {
  if (isDevelopment) {
    console.log(`[DEV] ${message}`, data);
  }
};

export const devWarn = (message: string, data?: any) => {
  if (isDevelopment) {
    console.warn(`[DEV] ${message}`, data);
  }
};

export const devError = (message: string, data?: any) => {
  if (isDevelopment) {
    console.error(`[DEV] ${message}`, data);
  }
};