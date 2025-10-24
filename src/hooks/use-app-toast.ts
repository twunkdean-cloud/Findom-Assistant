import { toast } from 'sonner';

export const useAppToast = () => {
  const showSuccess = (message: string, options?: { duration?: number }) => {
    return toast.success(message, options);
  };

  const showError = (message: string, options?: { duration?: number }) => {
    return toast.error(message, options);
  };

  const showInfo = (message: string, options?: { duration?: number }) => {
    return toast.info(message, options);
  };

  const showWarning = (message: string, options?: { duration?: number }) => {
    return toast.warning(message, options);
  };

  const showLoading = (message: string, options?: { duration?: number }) => {
    return toast.loading(message, options);
  };

  const dismiss = (id?: string | number) => {
    toast.dismiss(id);
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    dismiss,
  };
};