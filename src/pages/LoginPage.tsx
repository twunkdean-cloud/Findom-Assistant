import React, { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Crown, Heart } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle email confirmation
  useEffect(() => {
    const confirmEmail = async () => {
      const hashParams = new URLSearchParams(window.location.search);
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            toast.error('Error confirming email: ' + error.message);
            navigate('/login');
            return;
          }
          
          toast.success('Email confirmed successfully!');
          // Clean up URL
          const url = new URL(window.location.pathname);
          window.history.replaceState({}, url.pathname);
          navigate('/', { replace: true });
        } catch (error) {
          console.error('Error confirming email:', error);
          toast.error('Error confirming email');
          navigate('/login');
        }
      };
    };

    confirmEmail();
  }, [searchParams, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed in successfully!');
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error, data } = await signUp(email, password);
    
    if (error) {
      toast.error('Signup error: ' + error.message);
    } else {
      // Check if user was created successfully but needs confirmation
      if (data?.user && !data.user.email_confirmed_at) {
        toast.success('Account created! Please check your email to confirm your account.');
        // Also provide a manual confirmation option
        setTimeout(() => {
          toast.info('If you don\'t receive an email, please check your spam folder or try signing in after a few minutes.');
        }, 2000);
      } else if (data?.user) {
        // User is already confirmed
        toast.success('Account created and confirmed successfully!');
        navigate('/');
      } else {
        toast.success('Account created! Please check your email to verify.');
    }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-indigo-400" />
              <Heart className="h-8 w-8 text-pink-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Findom Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="bg-gray-900 border-gray-700 text-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="bg-gray-900 border-gray-700 text-gray-200"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="bg-gray-900 border-gray-700 text-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a password"
                    minLength={6}
                    className="bg-gray-900 border-gray-700 text-gray-200"
                  />
                </div>
                <div className="flex flex space-x-2">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)} className="flex-1 bg-gray-600 hover:bg-gray-700">
                    Cancel
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                You'll receive a confirmation email after signing up
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;