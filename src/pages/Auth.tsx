import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MusicWaves } from '@/components/MusicWaves';
import { toast } from '@/hooks/use-toast';
import { Music, GraduationCap, Mic2, Loader2 } from 'lucide-react';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100);
const rateSchema = z.number().min(100, 'Minimum rate is 100 KSH').max(100000);

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithProvider, loading: authLoading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setProviderLoading(true);
    const { error } = await signInWithProvider('google');
    if (error) {
      toast({ title: 'Google Sign In Failed', description: error.message, variant: 'destructive' });
    }
    setProviderLoading(false);
  };
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [hourlyRate, setHourlyRate] = useState(500);

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: 'Validation Error', description: err.errors[0].message, variant: 'destructive' });
        setLoading(false);
        return;
      }
    }

    const { error } = await signIn(email, password);
    
    if (error) {
      let message = error.message;
      if (message.includes('Invalid login credentials')) {
        message = 'Invalid email or password. Please try again.';
      }
      toast({ title: 'Login Failed', description: message, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome back!', description: 'Successfully logged in.' });
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      nameSchema.parse(fullName);
      if (userType === 'teacher') {
        rateSchema.parse(hourlyRate);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: 'Validation Error', description: err.errors[0].message, variant: 'destructive' });
        setLoading(false);
        return;
      }
    }

    const metadata = userType === 'teacher' 
      ? { full_name: fullName, role: userType, hourly_rate: hourlyRate }
      : { full_name: fullName, role: userType };

    const { error } = await signUp(email, password, metadata);
    
    if (error) {
      let message = error.message;
      if (message.includes('already registered')) {
        message = 'This email is already registered. Try logging in instead.';
      }
      toast({ title: 'Sign Up Failed', description: message, variant: 'destructive' });
    } else {
      toast({ 
        title: 'Account Created!', 
        description: userType === 'teacher' 
          ? 'Please complete your teacher profile.' 
          : 'Please check your email to verify your account.' 
      });
      // Redirect teachers to complete their profile
      if (userType === 'teacher') {
        navigate('/teacher-onboarding');
      }
    }
    
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <a href="/" className="flex items-center gap-2">
          <MusicWaves className="h-8 w-8" />
          <span className="font-display text-xl font-bold text-gradient">Tunetrails</span>
        </a>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Card className="shadow-card">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-display">Welcome Back</CardTitle>
                  <CardDescription>Sign in to your Tunetrails account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Sign In
                    </Button>
                  </form>

                  <div className="my-4 flex items-center">
                    <div className="flex-1 h-px bg-border" />
                    <span className="px-3 text-xs text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={providerLoading}>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path fill="#EA4335" d="M23.5 12.27c0-.8-.07-1.57-.2-2.31H12v4.38h6.36c-.27 1.48-1.02 2.73-2.18 3.58v2.98h3.53c2.06-1.9 3.25-4.7 3.25-8.63z"/>
                      <path fill="#34A853" d="M12 24c2.97 0 5.47-.98 7.29-2.66l-3.53-2.98C15.86 17.94 14.01 18.7 12 18.7c-2.92 0-5.4-1.97-6.28-4.61H2.06v2.9C3.88 21.89 7.75 24 12 24z"/>
                      <path fill="#4A90E2" d="M5.72 14.09A7.99 7.99 0 0 1 5.02 12c0-.65.11-1.27.31-1.86V7.24H2.06A11.99 11.99 0 0 0 0 12c0 1.9.41 3.7 1.13 5.31l4.59-3.22z"/>
                      <path fill="#FBBC05" d="M12 4.48c1.6 0 3.04.55 4.18 1.63l3.12-3.12C17.48 1.14 14.97 0 12 0 7.75 0 3.88 2.11 2.06 5.24l4.59 3.22C6.6 6.45 9.08 4.48 12 4.48z"/>
                    </svg>
                    {providerLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Continue with Google
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <Card className="shadow-card">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-display">Create Account</CardTitle>
                  <CardDescription>Join the Tunetrails community</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* User Type Selection */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setUserType('student')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        userType === 'student' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <GraduationCap className={`h-8 w-8 mx-auto mb-2 ${userType === 'student' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className={`font-medium ${userType === 'student' ? 'text-primary' : ''}`}>Student</p>
                      <p className="text-xs text-muted-foreground">Learn music</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('teacher')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        userType === 'teacher' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Mic2 className={`h-8 w-8 mx-auto mb-2 ${userType === 'teacher' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className={`font-medium ${userType === 'teacher' ? 'text-primary' : ''}`}>Teacher</p>
                      <p className="text-xs text-muted-foreground">Teach & earn</p>
                    </button>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    {userType === 'teacher' && (
                      <div className="space-y-2">
                        <Label htmlFor="hourly-rate">Hourly Rate (KSH)</Label>
                        <Input
                          id="hourly-rate"
                          type="number"
                          min={100}
                          max={100000}
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(Number(e.target.value))}
                          required
                        />
                        <p className="text-xs text-muted-foreground">You can change this later in your profile</p>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create {userType === 'teacher' ? 'Teacher' : 'Student'} Account
                    </Button>
                  </form>

                  <div className="my-4 flex items-center">
                    <div className="flex-1 h-px bg-border" />
                    <span className="px-3 text-xs text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={providerLoading}>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path fill="#EA4335" d="M23.5 12.27c0-.8-.07-1.57-.2-2.31H12v4.38h6.36c-.27 1.48-1.02 2.73-2.18 3.58v2.98h3.53c2.06-1.9 3.25-4.7 3.25-8.63z"/>
                      <path fill="#34A853" d="M12 24c2.97 0 5.47-.98 7.29-2.66l-3.53-2.98C15.86 17.94 14.01 18.7 12 18.7c-2.92 0-5.4-1.97-6.28-4.61H2.06v2.9C3.88 21.89 7.75 24 12 24z"/>
                      <path fill="#4A90E2" d="M5.72 14.09A7.99 7.99 0 0 1 5.02 12c0-.65.11-1.27.31-1.86V7.24H2.06A11.99 11.99 0 0 0 0 12c0 1.9.41 3.7 1.13 5.31l4.59-3.22z"/>
                      <path fill="#FBBC05" d="M12 4.48c1.6 0 3.04.55 4.18 1.63l3.12-3.12C17.48 1.14 14.97 0 12 0 7.75 0 3.88 2.11 2.06 5.24l4.59 3.22C6.6 6.45 9.08 4.48 12 4.48z"/>
                    </svg>
                    {providerLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Continue with Google
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Auth;
