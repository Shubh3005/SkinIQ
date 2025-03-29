
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import SkinCareAI from "./pages/SkinCareAI";
import SkinAnalyzer from "./pages/SkinAnalyzer";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { session, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

const queryClient = new QueryClient();

const App = () => {
  // Handle touch events better on mobile
  useEffect(() => {
    // Prevent double-tap zooming on mobile
    document.addEventListener('touchstart', function(event){
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }, { passive: false });
    
    // Prevent pinch zoom
    document.addEventListener('gesturestart', function(event) {
      event.preventDefault();
    });
    
    return () => {
      document.removeEventListener('touchstart', () => {});
      document.removeEventListener('gesturestart', () => {});
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
          <BrowserRouter>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/skincare-ai" element={
                  <ProtectedRoute>
                    <SkinCareAI />
                  </ProtectedRoute>
                } />
                <Route path="/skin-analyzer" element={
                  <ProtectedRoute>
                    <SkinAnalyzer />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
