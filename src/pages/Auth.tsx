
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import Logo from '@/components/Logo';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Auth = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { session, signIn, signUp, signInWithGoogle } = useAuth();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  useEffect(() => {
    // Redirect to home if already authenticated
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setIsLoading(true);
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setIsLoading(true);
      await signUp(email, password, name);
      // Not navigating here since user needs to verify email
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Redirect handled by the OAuth provider
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };
  
  const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col">
      <AnimatedBackground />
      
      <div className="flex-1 flex flex-col items-center justify-center w-full p-6">
        <motion.div
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={fadeVariants}
        >
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>
          
          <div className="bg-card shadow-xl shadow-primary/5 backdrop-blur-sm rounded-2xl border border-primary/10 p-8">
            <Tabs 
              value={activeTab} 
              onValueChange={(v) => setActiveTab(v as 'login' | 'register')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login" className="text-base">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="text-base">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10" 
                        placeholder="your@email.com" 
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Password</Label>
                      <button 
                        type="button"
                        className="text-xs text-primary hover:underline transition-all"
                        onClick={() => toast.info('Password reset functionality coming soon!')}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10" 
                        placeholder="••••••••" 
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-muted"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <FcGoogle className="mr-2 h-5 w-5" />
                    Google
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10" 
                        placeholder="Your full name" 
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="register-email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10" 
                        placeholder="your@email.com" 
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="register-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10" 
                        placeholder="Create a password (6+ characters)" 
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-muted"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <FcGoogle className="mr-2 h-5 w-5" />
                    Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>By continuing, you agree to our</p>
              <div className="flex justify-center gap-1 mt-1">
                <button className="text-primary hover:underline">Terms of Service</button>
                <span>&</span>
                <button className="text-primary hover:underline">Privacy Policy</button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
