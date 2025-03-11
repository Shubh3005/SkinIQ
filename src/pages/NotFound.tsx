
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import AnimatedBackground from "@/components/AnimatedBackground";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <AnimatedBackground />
      
      <div className="w-full max-w-screen-xl px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="md" />
        </motion.div>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <motion.div 
          className="text-center px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-block px-3 py-1 mb-6 text-xs font-medium rounded-full bg-secondary text-primary">
            404 Error
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Page not found</h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            We couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all
                    bg-primary text-primary-foreground hover:bg-primary/90
                    shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30
                    transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
