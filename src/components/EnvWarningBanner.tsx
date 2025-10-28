import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { usingFallbackCredentials } from '@/integrations/supabase/client';

const STORAGE_KEY = 'hideEnvWarning';

const EnvWarningBanner: React.FC = () => {
  const [hidden, setHidden] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setHidden(stored === '1');
  }, []);

  if (!usingFallbackCredentials || hidden) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setHidden(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Alert className="bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-200 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-600 dark:text-amber-300" />
            <div>
              <AlertTitle className="font-semibold">Supabase not fully configured</AlertTitle>
              <AlertDescription className="text-sm">
                The app is using fallback credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect with your project securely.
              </AlertDescription>
            </div>
          </div>
          <Button size="sm" variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-200" onClick={dismiss}>
            Dismiss
          </Button>
        </div>
      </Alert>
    </div>
  );
};

export default EnvWarningBanner;