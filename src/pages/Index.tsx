import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import AnimatedBackground from '@/components/AnimatedBackground';
import { toast } from 'sonner';
import { ChevronDown, LogOut, MessageSquare, User, Scan } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RoutineCalendar from '@/components/RoutineCalendar';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const {
          data,
          error
        } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (error) {
          console.error('Error fetching profile:', error);
          toast.error('Failed to load profile data');
        } else {
          setProfileData(data);
          console.log('Profile data loaded:', data);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const fadeVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.15 * i,
        duration: 0.7,
        ease: [0.33, 1, 0.68, 1]
      }
    })
  };
  
  const renderGreeting = () => {
    if (user && profileData) {
      const name = profileData.full_name || user.email?.split('@')[0] || 'there';
      return `Hello, ${name}! Welcome to SkinIQ.`;
    }
    return 'Smart skincare, personalized for you';
  };
  
  return <div className="min-h-screen w-full flex flex-col items-center">
      <AnimatedBackground />
      
      <div className="w-full max-w-screen-xl px-6 py-8 flex-1 flex flex-col">
        <motion.div className="flex justify-between items-center" initial={{
        opacity: 0,
        y: -10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.1
      }}>
          <Logo size="md" />
          
          {user ? <div className="flex items-center gap-4">
              <motion.button className={cn("px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all", "bg-primary/10 text-primary hover:bg-primary/20")} onClick={() => navigate('/skincare-ai')} initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 1.0
          }}>
                <MessageSquare className="h-4 w-4" />
                SkinCare AI
              </motion.button>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-10 w-10 cursor-pointer hover:opacity-90 transition-opacity border-2 border-primary/20">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {user.user_metadata?.full_name ? user.user_metadata.full_name.split(" ").map((n) => n[0]).join("").toUpperCase() : user.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  {profileData && profileData.skin_type && <div className="px-2 py-1 text-sm text-muted-foreground">
                      Skin type: {profileData.skin_type}
                    </div>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center" onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center" onClick={() => navigate('/skincare-ai')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    SkinCare AI
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center" onClick={() => navigate('/skin-analyzer')}>
                    <Scan className="mr-2 h-4 w-4" />
                    Skin Analyzer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center text-destructive focus:text-destructive" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div> : <motion.button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors" onClick={() => navigate('/auth')} initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 1.2
        }}>
              Sign In
            </motion.button>}
        </motion.div>
        
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="text-center max-w-2xl mx-auto">
            <motion.div className="inline-block px-3 py-1 mb-6 text-xs font-medium rounded-full bg-secondary text-primary" custom={0} initial="hidden" animate={isLoaded ? "visible" : "hidden"} variants={fadeVariants}>
              Your AI-powered skin care companion
            </motion.div>
            
            <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-balance" custom={1} initial="hidden" animate={isLoaded ? "visible" : "hidden"} variants={fadeVariants}>
              {user ? <>
                  Welcome back,
                  <br />
                  <span className="text-primary">
                    {profileData?.full_name || user.email?.split('@')[0] || 'User'}
                  </span>
                </> : <>
                  Smart skincare,
                  <br />
                  <span className="text-primary">
                    personalized for you
                  </span>
                </>}
            </motion.h1>
            
            <motion.p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto text-balance" custom={2} initial="hidden" animate={isLoaded ? "visible" : "hidden"} variants={fadeVariants}>
              SkinIQ uses advanced AI to analyze your skin, recommend personalized
              routines, and help you achieve your healthiest skin ever.
            </motion.p>
            
            <motion.div custom={3} initial="hidden" animate={isLoaded ? "visible" : "hidden"} variants={fadeVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? <button onClick={() => navigate('/auth')} className={cn("px-6 py-3 rounded-xl font-medium transition-all", "bg-primary text-primary-foreground hover:bg-primary/90", "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30", "transform hover:-translate-y-0.5 active:translate-y-0")}>
                  Get Started
                </button> : <button onClick={() => navigate('/skin-analyzer')} className={cn("px-6 py-3 rounded-xl font-medium transition-all", "bg-primary text-primary-foreground hover:bg-primary/90", "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30", "transform hover:-translate-y-0.5 active:translate-y-0")}>
                  Analyze My Skin
                </button>}
              
              <button 
                onClick={() => navigate('/skincare-ai')}
                className={cn(
                  "px-6 py-3 rounded-xl font-medium transition-all",
                  "bg-primary/10 text-primary hover:bg-primary/20",
                  "shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10",
                  "transform hover:-translate-y-0.5 active:translate-y-0"
                )}
              >
                <MessageSquare className="mr-2 h-4 w-4 inline-block" />
                SkinCare AI
              </button>
            </motion.div>
            
            <motion.div className="mt-16" custom={4} initial="hidden" animate={isLoaded ? "visible" : "hidden"} variants={fadeVariants}>
              <button onClick={() => {
              document.getElementById('routine-tracker')?.scrollIntoView({
                behavior: 'smooth'
              });
            }} className="animate-bounce flex flex-col items-center text-sm text-center text-stone-400 my-0 mx-auto">
                Scroll to track your routines
                <ChevronDown className="mt-1 h-5 w-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
      
      <div id="routine-tracker" className="w-full px-6 py-16 bg-background/80 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Track Your Skincare Journey</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Consistency is key to effective skincare. Track your morning and evening routines, 
              build a streak, and earn achievement badges as you take care of your skin.
            </p>
          </div>
          
          {user ? (
            <RoutineCalendar />
          ) : (
            <div className="text-center bg-card p-10 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Sign in to track your routines</h3>
              <p className="text-muted-foreground mb-6">
                Create an account to track your skincare routines, earn achievements, and get personalized recommendations.
              </p>
              <Button onClick={() => navigate('/auth')} size="lg">
                Sign In or Register
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div id="learn-more" className="w-full bg-card py-20 px-6">
        <div className="max-w-screen-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How SkinIQ Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
            icon: "🔍",
            title: "Analyze",
            description: "Our AI analyzes your skin and identifies your unique skin type and concerns."
          }, {
            icon: "✨",
            title: "Recommend",
            description: "Get personalized skincare routines and product recommendations based on your skin needs."
          }, {
            icon: "📈",
            title: "Track",
            description: "Monitor your skin's progress and adjust your routine as your skin improves."
          }].map((feature, index) => <div key={index} className="bg-background p-6 rounded-xl shadow-md">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>)}
          </div>

          <div className="mt-12">
            <Button variant="default" size="lg" onClick={() => navigate('/skin-analyzer')} className="group">
              <Scan className="mr-2 h-4 w-4 group-hover:animate-pulse" />
              Try Skin Analyzer
            </Button>
          </div>
        </div>
      </div>
      
      <footer className="w-full py-8 px-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} SkinIQ. All rights reserved.</p>
      </footer>
    </div>;
};

export default Index;
