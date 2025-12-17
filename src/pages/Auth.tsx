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
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  
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
