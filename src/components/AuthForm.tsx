
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowRight, Mail, Lock, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthFormProps {
  className?: string;
  onSuccess?: () => void;
}

const AuthForm = ({ className, onSuccess }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || (activeTab === 'register' && !name)) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // This is where we would connect to Supabase
      // For now, just simulate a successful login after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(activeTab === 'login' 
        ? 'Logged in successfully!' 
        : 'Account created successfully!'
      );
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={cn("w-full max-w-md", className)}>
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
          <form onSubmit={handleAuth} className="space-y-6">
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
                <a 
                  href="#" 
                  className="text-xs text-primary hover:underline transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info('Password reset functionality coming soon!');
                  }}
                >
                  Forgot password?
                </a>
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
              className="w-full group relative"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="register" className="mt-0">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="name" 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10" 
                  placeholder="Your name" 
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
                  placeholder="Create a password" 
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full group relative"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>By continuing, you agree to our</p>
        <div className="flex justify-center gap-1 mt-1">
          <a href="#" className="text-primary hover:underline">Terms of Service</a>
          <span>&</span>
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
