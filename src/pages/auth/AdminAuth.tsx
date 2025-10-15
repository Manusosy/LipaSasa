import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';

const ALLOWED_DOMAIN = 'kazinikazi.co.ke';

export const AdminAuth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Add small delay to ensure trigger has completed
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check if user is admin with retry
          let roleData = null;
          for (let i = 0; i < 3; i++) {
            const { data } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();
            
            roleData = data;
            if (roleData?.role === 'admin') break;
            if (i < 2) await new Promise(resolve => setTimeout(resolve, 500));
          }

          if (roleData?.role === 'admin') {
            navigate('/admin');
          } else {
            // Not an admin, sign out
            await supabase.auth.signOut();
            setError('Access denied. Admin access only.');
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (roleData?.role === 'admin') {
          navigate('/admin');
        } else {
          await supabase.auth.signOut();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateEmail = (email: string): boolean => {
    const emailDomain = email.split('@')[1];
    return emailDomain === ALLOWED_DOMAIN;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate domain
    if (!validateEmail(email)) {
      setError('Invalid email address. Please check your credentials.');
      setLoading(false);
      return;
    }

    // Validate password match
    if (password !== repeatPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!fullName || !phoneNumber) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      // Create the admin user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            owner_name: fullName,
            phone: phoneNumber,
            business_name: `${fullName}'s Admin Account`,
            country: 'Kenya',
            industry: 'Technology',
            selected_plan: 'admin',
            subscribe_newsletter: false,
          },
        },
      });

      if (signUpError) {
        setError('Failed to create admin account. Please try again.');
        setLoading(false);
        return;
      }

      if (data.user) {
        setSuccess('Admin account created successfully! Signing you in...');
        
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Automatically sign in the user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setSuccess('Account created! Please sign in manually.');
          setTimeout(() => {
            setIsSignUp(false);
            setPassword('');
            setRepeatPassword('');
            setFullName('');
            setPhoneNumber('');
            setSuccess('');
          }, 2000);
          return;
        }

        // Check admin role with retry logic
        let attempts = 0;
        let isAdmin = false;
        
        while (attempts < 3 && !isAdmin) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', signInData.user.id)
            .single();

          if (roleData?.role === 'admin') {
            isAdmin = true;
            // Auth state listener will handle the redirect to /admin
          } else {
            attempts++;
            if (attempts < 3) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }

        if (!isAdmin) {
          await supabase.auth.signOut();
          setError('Admin role assignment pending. Please contact support.');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate domain without revealing it in the error message
    if (!validateEmail(email)) {
      setError('Invalid email address. Please check your credentials.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Generic error message to not reveal information
        setError('Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      // Check if user has admin role
      if (data.user) {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (roleError || roleData?.role !== 'admin') {
          // Sign them out immediately
          await supabase.auth.signOut();
          setError('Access denied. Admin access only.');
          setLoading(false);
          return;
        }

        // Admin verified, will redirect via auth state listener
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Dark Background with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=2070')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95" />
      
      {/* Secure Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-white mb-4">
            <img 
              src="/chapapay.png" 
              alt="LipaSasa" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Admin Access</h1>
          <p className="text-white/70 drop-shadow">Authorized personnel only</p>
        </div>

        <Card className="shadow-2xl backdrop-blur-sm bg-slate-900/80 border-red-500/30 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Lock className="h-5 w-5 text-red-400" />
              {isSignUp ? 'Create Admin Account' : 'Secure Sign In'}
            </CardTitle>
            <CardDescription className="text-white/60">
              {isSignUp ? 'Register a new administrator account' : 'Enter your authorized credentials'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSignUp ? (
              // SIGN IN FORM
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-white/90">Email Address</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-white/90">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                
                {error && (
                  <Alert variant="destructive" className="bg-red-900/50 border-red-500/50 text-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-900/50 border-green-500/50 text-green-200">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white" 
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-sm text-red-400 hover:text-red-300 underline"
                  >
                    Need to create an admin account?
                  </button>
                </div>
              </form>
            ) : (
              // SIGN UP FORM
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-fullname" className="text-white/90">Full Name</Label>
                  <Input
                    id="admin-fullname"
                    type="text"
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-phone" className="text-white/90">Phone Number</Label>
                  <Input
                    id="admin-phone"
                    type="tel"
                    placeholder="e.g., +254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-signup-email" className="text-white/90">Email Address</Label>
                  <Input
                    id="admin-signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-signup-password" className="text-white/90">Password</Label>
                  <Input
                    id="admin-signup-password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-repeat-password" className="text-white/90">Repeat Password</Label>
                  <Input
                    id="admin-repeat-password"
                    type="password"
                    placeholder="Re-enter password"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                
                {error && (
                  <Alert variant="destructive" className="bg-red-900/50 border-red-500/50 text-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-900/50 border-green-500/50 text-green-200">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white" 
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Admin Account'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError('');
                      setSuccess('');
                      setEmail('');
                      setPassword('');
                      setRepeatPassword('');
                      setFullName('');
                      setPhoneNumber('');
                    }}
                    className="text-sm text-red-400 hover:text-red-300 underline"
                  >
                    Already have an admin account?
                  </button>
                </div>
              </form>
            )}

            <div className="text-center mt-6 pt-4 border-t border-slate-700/50">
              <p className="text-xs text-white/40">
                This area is restricted to authorized administrators only.
                <br />
                All access attempts are logged.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

