import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Droplet, ShieldCheck, Sun, Sparkles, Palette, RefreshCw, Scan } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";

const SkinAnalyzer = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<null | {
    skinType: string;
    skinIssues: string;
    sunDamage: string;
    uniqueFeature: string;
    skinTone: string;
  }>(null);

  // Start webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        toast.success("Camera activated successfully");
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture and analyze
  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      setAnalyzing(true);
      
      // Draw video frame to canvas
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Simulate API call to analyze skin
      // In a real scenario, this would be a call to an AI service
      setTimeout(() => {
        // Mock results - in a real app, this would come from the API
        setAnalysisResults({
          skinType: ['normal', 'dry', 'oily', 'combination', 'sensitive'][Math.floor(Math.random() * 5)],
          skinIssues: Math.random() > 0.5 ? 'Minor acne detected' : 'No major issues detected',
          sunDamage: Math.random() > 0.6 ? 'Minimal' : 'None detected',
          uniqueFeature: 'None detected',
          skinTone: ['Light', 'Medium', 'Dark'][Math.floor(Math.random() * 3)]
        });
        
        // Save results to profile if user is logged in
        if (user) {
          saveResultsToProfile();
        }
        
        setAnalyzing(false);
        toast.success("Analysis complete");
      }, 3000);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error("Analysis failed. Please try again.");
      setAnalyzing(false);
    }
  };

  // Save results to user profile
  const saveResultsToProfile = async () => {
    if (!user || !analysisResults) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          skin_type: analysisResults.skinType,
          last_analysis: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error saving to profile:', error);
        toast.error("Failed to save results to your profile");
      } else {
        toast.success("Results saved to your profile");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <AnimatedBackground />
      
      <div className="w-full max-w-screen-xl px-6 py-8 flex-1 flex flex-col">
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="md" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold">SkinIQ</h1>
          <p className="text-muted-foreground mt-2">
            Advanced AI-powered skin analysis and recommendation system
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
          {/* Left column - Camera and controls */}
          <div className="flex flex-col">
            <Card className="w-full h-full flex flex-col">
              <CardContent className="flex-1 p-6 flex flex-col items-center justify-center">
                <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                  {!cameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-primary">
                      <Droplet className="w-16 h-16 mb-4" />
                      <h2 className="text-xl font-semibold mb-2">SkinIQ Analyzer</h2>
                      <p className="text-center text-sm text-muted-foreground mb-4">
                        Advanced AI-powered skin<br />analysis system
                      </p>
                    </div>
                  )}
                  <video 
                    ref={videoRef}
                    className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`}
                    muted
                    playsInline
                  />
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
                
                <Button 
                  className="w-full max-w-xs"
                  onClick={cameraActive ? captureAndAnalyze : startCamera}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : cameraActive ? (
                    <>
                      <Scan className="mr-2 h-4 w-4" />
                      Scan Skin
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Activate Scanner
                    </>
                  )}
                </Button>
                
                {cameraActive && (
                  <Button 
                    variant="outline" 
                    className="mt-2 w-full max-w-xs"
                    onClick={stopCamera}
                  >
                    Cancel
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Analysis results */}
          <div className="flex flex-col">
            <Card className="w-full h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Scan className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Skin Analysis</h2>
                  </div>
                  <div className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">
                    READY
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
                  <span className="block w-2 h-2 rounded-full bg-primary"></span>
                  AI dermatology system ready for scan
                </p>
                
                {/* Results cards */}
                <div className="space-y-4">
                  <ResultCard 
                    icon={<Droplet className="h-5 w-5 text-blue-400" />}
                    title="Skin Type"
                    value={analysisResults?.skinType || "Not analyzed"}
                  />
                  
                  <ResultCard 
                    icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                    title="Skin Issues"
                    value={analysisResults?.skinIssues || "Not analyzed"}
                  />
                  
                  <ResultCard 
                    icon={<Sun className="h-5 w-5 text-amber-400" />}
                    title="Sun Damage"
                    value={analysisResults?.sunDamage || "Not analyzed"}
                  />
                  
                  <ResultCard 
                    icon={<Sparkles className="h-5 w-5 text-purple-400" />}
                    title="Unique Feature"
                    value={analysisResults?.uniqueFeature || "None detected"}
                  />
                  
                  <ResultCard 
                    icon={<Palette className="h-5 w-5 text-green-400" />}
                    title="Skin Tone"
                    value={analysisResults?.skinTone || "Not analyzed"}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-400" />
            UV damage analysis
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Dermatologist-verified AI
          </div>
        </div>
      </div>
    </div>
  );
};

// Result card component
const ResultCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) => {
  return (
    <div className="bg-card/60 rounded-lg p-4 flex items-start gap-3">
      <div className="mt-1">{icon}</div>
      <div>
        <h3 className="text-sm text-muted-foreground font-medium mb-1">{title}</h3>
        <p className="font-mono">{value}</p>
      </div>
    </div>
  );
};

export default SkinAnalyzer;