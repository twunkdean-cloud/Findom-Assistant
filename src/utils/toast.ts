import { toast as sonnerToast } from 'sonner';

const defaultOptions = { duration: 3000 };

// Use sonner as primary toast system
export const toast = {
  success: (message: string, options?: any) => sonnerToast.success(message, { ...defaultOptions, ...(options || {}) }),
  error: (message: string, options?: any) => sonnerToast.error(message, { ...defaultOptions, ...(options || {}) }),
  info: (message: string, options?: any) => sonnerToast.info(message, { ...defaultOptions, ...(options || {}) }),
  warning: (message: string, options?: any) => sonnerToast.warning(message, { ...defaultOptions, ...(options || {}) }),
  loading: (message: string, options?: any) => sonnerToast.loading(message, { ...defaultOptions, ...(options || {}) }),
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};