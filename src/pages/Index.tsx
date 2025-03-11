
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import AuthForm from '@/components/AuthForm';
import AnimatedBackground from '@/components/AnimatedBackground';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  
  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleAuthSuccess = () => {
    toast.success('Welcome to SkinIQ!');
    // In a real app, we would redirect to the dashboard or set authenticated state
  };
  
  const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.15 * i,
        duration: 0.7,
        ease: [0.33, 1, 0.68, 1]
      }
    })
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <AnimatedBackground />
      
      <div className="w-full max-w-screen-xl px-6 py-8 flex-1 flex flex-col">
        {/* Header */}
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Logo size="md" />
          
          {!showAuth && (
            <motion.button
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              onClick={() => setShowAuth(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Sign In
            </motion.button>
          )}
        </motion.div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {!showAuth ? (
            <div className="text-center max-w-2xl mx-auto">
              <motion.div 
                className="inline-block px-3 py-1 mb-6 text-xs font-medium rounded-full bg-secondary text-primary"
                custom={0}
                initial="hidden"
                animate={isLoaded ? "visible" : "hidden"}
                variants={fadeVariants}
              >
                Your AI-powered skin care companion
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-balance"
                custom={1}
                initial="hidden"
                animate={isLoaded ? "visible" : "hidden"}
                variants={fadeVariants}
              >
                Smart skincare,
                <br />
                <span className="text-primary">
                  personalized for you
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto text-balance"
                custom={2}
                initial="hidden"
                animate={isLoaded ? "visible" : "hidden"}
                variants={fadeVariants}
              >
                SkinIQ uses advanced AI to analyze your skin, recommend personalized
                routines, and help you achieve your healthiest skin ever.
              </motion.p>
              
              <motion.div
                custom={3}
                initial="hidden"
                animate={isLoaded ? "visible" : "hidden"}
                variants={fadeVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button
                  onClick={() => setShowAuth(true)}
                  className={cn(
                    "px-6 py-3 rounded-xl font-medium transition-all",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
                    "transform hover:-translate-y-0.5 active:translate-y-0"
                  )}
                >
                  Get Started
                </button>
                
                <button
                  onClick={() => {
                    // Scroll to learn more section
                    document.getElementById('learn-more')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                  className={cn(
                    "px-6 py-3 rounded-xl font-medium transition-all",
                    "bg-secondary text-foreground hover:bg-secondary/80"
                  )}
                >
                  Learn More
                </button>
              </motion.div>
              
              <motion.div
                className="mt-16"
                custom={4}
                initial="hidden"
                animate={isLoaded ? "visible" : "hidden"}
                variants={fadeVariants}
              >
                <button
                  onClick={() => {
                    document.getElementById('learn-more')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                  className="animate-bounce flex flex-col items-center text-sm text-muted-foreground"
                >
                  Scroll to learn more
                  <ChevronDown className="mt-1 h-5 w-5" />
                </button>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-full max-w-md mx-auto">
                <AuthForm
                  onSuccess={handleAuthSuccess}
                  className="bg-card shadow-xl shadow-skin-300/5 backdrop-blur-sm rounded-2xl border-skin-200/50 p-8"
                />
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAuth(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to Home
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Learn more section */}
      <div id="learn-more" className="w-full bg-card py-20 px-6">
        <div className="max-w-screen-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How SkinIQ Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔍",
                title: "Analyze",
                description: "Our AI analyzes your skin and identifies your unique skin type and concerns."
              },
              {
                icon: "✨",
                title: "Recommend",
                description: "Get personalized skincare routines and product recommendations based on your skin needs."
              },
              {
                icon: "📈",
                title: "Track",
                description: "Monitor your skin's progress and adjust your routine as your skin improves."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-background p-6 rounded-xl shadow-md">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full py-8 px-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} SkinIQ. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
