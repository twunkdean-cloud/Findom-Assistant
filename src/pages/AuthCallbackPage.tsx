import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from '@/utils/toast';

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase email confirmations provide tokens in the URL hash
        const hash = window.location.hash || '';
        const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            toast.error('Error confirming email');
            navigate('/login');
            return;
          }

          toast.success('Email confirmed successfully!');
          // Clean hash from URL
          window.history.replaceState({}, '', window.location.pathname);
          navigate('/', { replace: true });
          return;
        }

        // Fallback to getting current session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          toast.error('Error confirming email');
          navigate('/login');
          return;
        }

        if (data.session) {
          toast.success('Email confirmed successfully!');
          navigate('/', { replace: true });
        } else {
          toast.error('No session found');
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Error during authentication');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-gray-400">Confirming your email...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;