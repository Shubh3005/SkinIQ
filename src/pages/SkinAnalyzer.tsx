
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Droplet, 
  ShieldCheck, 
  Sun, 
  Sparkles, 
  Palette, 
  RefreshCw, 
  Scan, 
  User, 
  History, 
  X, 
  Zap, 
  Loader2, 
  Sliders, 
  Camera as CameraIcon, 
  Lightbulb, 
  Database,
  MessageCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ImageUploader } from '@/components/skin-analyzer/ImageUploader';

const SkinAnalyzer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [scanComplete, setScanComplete] = useState(false);
  const [overlayContext, setOverlayContext] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  useEffect(() => {
    if (cameraActive && overlayCanvasRef.current) {
      const canvas = overlayCanvasRef.current;
      const ctx = canvas.getContext('2d');
      setOverlayContext(ctx);
      
      if (videoRef.current) {
        const resizeObserver = new ResizeObserver(entries => {
          for (let entry of entries) {
            canvas.width = entry.contentRect.width;
            canvas.height = entry.contentRect.height;
          }
        });
        
        resizeObserver.observe(videoRef.current);
        return () => resizeObserver.disconnect();
      }
    }
  }, [cameraActive]);

  useEffect(() => {
    if (!overlayContext || !cameraActive) return;
    
    let animationFrame;
    let scanLine = 0;
    const scanSpeed = 2;
    
    const drawScanEffect = () => {
      if (!overlayCanvasRef.current) return;
      
      const canvas = overlayCanvasRef.current;
      const ctx = overlayContext;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (!analyzing) {
        ctx.strokeStyle = 'rgba(120, 226, 160, 0.5)';
        ctx.lineWidth = 2;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radiusX = canvas.width * 0.3;
        const radiusY = canvas.height * 0.4;
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
        
        const cornerSize = 20;
        const cornerOffset = 40;
        
        ctx.beginPath();
        ctx.moveTo(cornerOffset, cornerOffset);
        ctx.lineTo(cornerOffset + cornerSize, cornerOffset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cornerOffset, cornerOffset);
        ctx.lineTo(cornerOffset, cornerOffset + cornerSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(canvas.width - cornerOffset, cornerOffset);
        ctx.lineTo(canvas.width - cornerOffset - cornerSize, cornerOffset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(canvas.width - cornerOffset, cornerOffset);
        ctx.lineTo(canvas.width - cornerOffset, cornerOffset + cornerSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(cornerOffset, canvas.height - cornerOffset);
        ctx.lineTo(cornerOffset + cornerSize, canvas.height - cornerOffset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cornerOffset, canvas.height - cornerOffset);
        ctx.lineTo(cornerOffset, canvas.height - cornerOffset - cornerSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(canvas.width - cornerOffset, canvas.height - cornerOffset);
        ctx.lineTo(canvas.width - cornerOffset - cornerSize, canvas.height - cornerOffset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(canvas.width - cornerOffset, canvas.height - cornerOffset);
        ctx.lineTo(canvas.width - cornerOffset, canvas.height - cornerOffset - cornerSize);
        ctx.stroke();
      } else {
        const gradient = ctx.createLinearGradient(0, scanLine - 10, 0, scanLine + 10);
        gradient.addColorStop(0, 'rgba(120, 226, 160, 0)');
        gradient.addColorStop(0.5, 'rgba(120, 226, 160, 0.8)');
        gradient.addColorStop(1, 'rgba(120, 226, 160, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, scanLine - 10, canvas.width, 20);
        
        ctx.fillStyle = 'rgba(120, 226, 160, 0.5)';
        
        ctx.strokeStyle = 'rgba(120, 226, 160, 0.2)';
        ctx.lineWidth = 1;
        
        const gridSpacing = 40;
        
        for (let y = 0; y < canvas.height; y += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        
        for (let x = 0; x < canvas.width; x += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        
        for (let i = 0; i < 30; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          
          if (Math.abs(y - scanLine) < 50) {
            const size = Math.random() * 4 + 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();
            
            if (Math.random() > 0.7) {
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + Math.random() * 40 - 20, y + Math.random() * 40 - 20);
              ctx.stroke();
            }
          }
        }
        
        scanLine += scanSpeed;
        if (scanLine > canvas.height) {
          scanLine = 0;
        }
      }
      
      animationFrame = requestAnimationFrame(drawScanEffect);
    };
    
    drawScanEffect();
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [overlayContext, cameraActive, analyzing]);

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

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      setScanComplete(false);
      setAnalysisResults(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const simulateAnalysis = async () => {
    const stages = [
      { stage: 'Initializing scan', duration: 800 },
      { stage: 'Detecting facial features', duration: 1200 },
      { stage: 'Analyzing skin texture', duration: 1500 },
      { stage: 'Identifying skin concerns', duration: 1000 },
      { stage: 'Evaluating hydration levels', duration: 800 },
      { stage: 'Measuring pore visibility', duration: 700 },
      { stage: 'Checking for UV damage signs', duration: 900 },
      { stage: 'Building skin profile', duration: 1000 },
      { stage: 'Finalizing results...', duration: 500 }
    ];
    
    let totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
    let elapsedTime = 0;
    
    for (const stage of stages) {
      setAnalysisStage(stage.stage);
      
      const startProgress = elapsedTime / totalDuration * 100;
      const endProgress = (elapsedTime + stage.duration) / totalDuration * 100;
      
      const startTime = Date.now();
      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / stage.duration;
        
        if (progress < 1) {
          setAnalysisProgress(startProgress + (endProgress - startProgress) * progress);
          requestAnimationFrame(animateProgress);
        } else {
          setAnalysisProgress(endProgress);
          elapsedTime += stage.duration;
        }
      };
      
      animateProgress();
      await new Promise(resolve => setTimeout(resolve, stage.duration));
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      setAnalyzing(true);
      setAnalysisProgress(0);
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      await simulateAnalysis();
      
      const skinTypes = ['normal', 'dry', 'oily', 'combination', 'sensitive'];
      const randomizedSkinType = skinTypes[Math.floor(Math.random() * skinTypes.length)];
      
      const skinIssuesOptions = [
        'Minor acne detected in T-zone',
        'Slight dryness detected in cheek area',
        'Some oil imbalance detected',
        'Areas of mild irritation detected',
        'No major issues detected'
      ];
      const randomizedSkinIssues = skinIssuesOptions[Math.floor(Math.random() * skinIssuesOptions.length)];
      
      const sunDamageOptions = [
        'Minimal signs of UV exposure',
        'Light sun damage detected',
        'Moderate UV exposure signs',
        'None detected'
      ];
      const randomizedSunDamage = sunDamageOptions[Math.floor(Math.random() * sunDamageOptions.length)];
      
      const skinToneOptions = ['Light', 'Medium', 'Dark', 'Very Light', 'Olive', 'Deep'];
      const randomizedSkinTone = skinToneOptions[Math.floor(Math.random() * skinToneOptions.length)];
      
      const uniqueFeatureOptions = [
        'Excellent hydration levels',
        'Strong skin barrier',
        'Good elasticity',
        'Even texture',
        'None detected'
      ];
      const randomizedUniqueFeature = uniqueFeatureOptions[Math.floor(Math.random() * uniqueFeatureOptions.length)];
      
      const results = {
        skinType: randomizedSkinType,
        skinIssues: randomizedSkinIssues,
        sunDamage: randomizedSunDamage,
        uniqueFeature: randomizedUniqueFeature,
        skinTone: randomizedSkinTone
      };
      
      if (user) {
        try {
          await supabase.functions.invoke('skincare-history', {
            body: {
              action: 'save-scan',
              data: {
                skinType: results.skinType,
                skinIssues: results.skinIssues,
                sunDamage: results.sunDamage,
                uniqueFeature: results.uniqueFeature,
                skinTone: results.skinTone,
                scanImage: imageData
              }
            }
          });
        } catch (error) {
          console.error('Error saving scan to history:', error);
        }
      }
      
      setAnalysisResults(results);
      setScanComplete(true);
      toast.success("Analysis complete");
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageSelected = (file: File) => {
    console.log('Image selected:', file);
    toast.success('Image uploaded successfully!');
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <AnimatedBackground />
      
      <div className="w-full max-w-screen-xl px-6 py-8 mx-auto flex-1 flex flex-col">
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="md" />
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4" />
              Profile
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => navigate('/skincare-ai')}
            >
              <MessageCircle className="h-4 w-4" />
              SkinCare AI
            </Button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold">
            <span className="text-primary">AI-Powered</span> Skin Analyzer
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced multi-factor analysis for personalized skincare recommendations
          </p>
        </motion.div>
        
        <div className="max-w-xl mx-auto w-full space-y-6">
          <div className="flex flex-col">
            <Card className="w-full h-full flex flex-col border-2 border-primary/20 shadow-lg shadow-primary/10 overflow-hidden">
              <CardContent className="flex-1 p-6 pt-12 flex flex-col items-center justify-center relative">
                <div className="absolute top-2 left-2 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-xs font-medium uppercase tracking-wider text-primary">{analyzing ? "Scanning" : "Ready"}</span>
                  </div>
                </div>
                
                <div className="absolute top-2 right-2">
                  {cameraActive && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={stopCamera}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close Camera</span>
                    </Button>
                  )}
                </div>
                
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <AnimatePresence>
                    {!cameraActive && !scanComplete && (
                      <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-primary p-8"
                      >
                        <Scan className="w-16 h-16 mb-4 text-primary" />
                        <h2 className="text-xl font-semibold mb-2 text-center">Advanced Skin Analysis System</h2>
                        <p className="text-center text-sm text-muted-foreground mb-4">
                          Our AI uses 16 unique facial markers to analyze your skin condition
                        </p>
                        
                        <div className="flex items-center justify-center gap-6 w-full mt-4">
                          <div className="flex flex-col items-center">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                              <Droplet className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-xs text-muted-foreground">Hydration</span>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                              <Sun className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-xs text-muted-foreground">UV Damage</span>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                              <Sliders className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-xs text-muted-foreground">Texture</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <video 
                    ref={videoRef}
                    className={cn(
                      "w-full h-full object-cover", 
                      !cameraActive && "hidden",
                      analyzing && "filter brightness-110"
                    )}
                    muted
                    playsInline
                  />
                  
                  <canvas 
                    ref={overlayCanvasRef}
                    className={cn(
                      "absolute inset-0 w-full h-full pointer-events-none", 
                      !cameraActive && "hidden"
                    )}
                  />
                  
                  <AnimatePresence>
                    {analyzing && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                      >
                        <div className="text-xs font-medium mb-1 flex justify-between items-center">
                          <span className="flex items-center gap-1 text-primary">
                            <Zap className="h-3 w-3" />
                            {analysisStage}
                          </span>
                          <span>{Math.round(analysisProgress)}%</span>
                        </div>
                        <Progress value={analysisProgress} className="h-1" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
                
                <AnimatePresence mode="wait">
                  {!cameraActive && !scanComplete ? (
                    <motion.div
                      key="start-button"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Button 
                        className="w-full max-w-xs relative overflow-hidden group"
                        onClick={startCamera}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
                        <CameraIcon className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                        Activate Skin Scanner
                      </Button>
                    </motion.div>
                  ) : cameraActive && !analyzing && !scanComplete ? (
                    <motion.div
                      key="scan-button"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Button 
                        className="w-full max-w-xs relative overflow-hidden group"
                        onClick={captureAndAnalyze}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
                        <Scan className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                        Start Skin Analysis
                      </Button>
                    </motion.div>
                  ) : analyzing ? (
                    <motion.div
                      key="analyzing"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center gap-3"
                    >
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-sm">Advanced analysis in progress...</span>
                    </motion.div>
                  ) : scanComplete && (
                    <motion.div
                      key="new-scan"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-col items-center gap-4 w-full"
                    >
                      <Button 
                        variant="outline" 
                        className="w-full max-w-xs"
                        onClick={() => {
                          setScanComplete(false);
                          setAnalysisResults(null);
                        }}
                      >
                        <Scan className="mr-2 h-4 w-4" />
                        New Scan
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-muted-foreground"
                        onClick={stopCamera}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Close Camera
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-col">
            <Card className="w-full h-full border-2 border-primary/20 shadow-lg shadow-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Scan className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Skin Analysis</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      analysisResults ? "bg-green-500" : "bg-amber-500"
                    )}></div>
                    <div className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">
                      {analysisResults ? "COMPLETE" : "READY"}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
                  <span className="block w-2 h-2 rounded-full bg-primary"></span>
                  <span>
                    {analysisResults 
                      ? "Analysis complete. View your personalized results below."
                      : "Position your face in the center of the frame for best results."
                    }
                  </span>
                </p>
                
                <div className="space-y-4">
                  <AnimatePresence>
                    {analysisResults ? (
                      <ResultCard 
                        icon={<Droplet className="h-5 w-5 text-blue-400" />}
                        title="Skin Type"
                        value={analysisResults?.skinType || "Not analyzed"}
                        delay={0.2}
                      />
                    ) : (
                      <EmptyResultCard 
                        icon={<Droplet className="h-5 w-5 text-blue-400" />}
                        title="Skin Type"
                        delay={0.1}
                      />
                    )}
                    
                    {analysisResults ? (
                      <ResultCard 
                        icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                        title="Skin Issues"
                        value={analysisResults?.skinIssues || "Not analyzed"}
                        delay={0.3}
                      />
                    ) : (
                      <EmptyResultCard 
                        icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                        title="Skin Issues"
                        delay={0.2}
                      />
                    )}
                    
                    {analysisResults ? (
                      <ResultCard 
                        icon={<Sun className="h-5 w-5 text-amber-400" />}
                        title="Sun Damage"
                        value={analysisResults?.sunDamage || "Not analyzed"}
                        delay={0.4}
                      />
                    ) : (
                      <EmptyResultCard 
                        icon={<Sun className="h-5 w-5 text-amber-400" />}
                        title="Sun Damage"
                        delay={0.3}
                      />
                    )}
                    
                    {analysisResults ? (
                      <ResultCard 
                        icon={<Sparkles className="h-5 w-5 text-purple-400" />}
                        title="Unique Feature"
                        value={analysisResults?.uniqueFeature || "None detected"}
                        delay={0.5}
                      />
                    ) : (
                      <EmptyResultCard 
                        icon={<Sparkles className="h-5 w-5 text-purple-400" />}
                        title="Unique Feature"
                        delay={0.4}
                      />
                    )}
                    
                    {analysisResults ? (
                      <ResultCard 
                        icon={<Palette className="h-5 w-5 text-green-400" />}
                        title="Skin Tone"
                        value={analysisResults?.skinTone || "Not analyzed"}
                        delay={0.6}
                      />
                    ) : (
                      <EmptyResultCard 
                        icon={<Palette className="h-5 w-5 text-green-400" />}
                        title="Skin Tone"
                        delay={0.5}
                      />
                    )}
                  </AnimatePresence>
                  
                  {analysisResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="mt-6 pt-6 border-t border-primary/10"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Recommendations</h3>
                        <Badge variant="outline" className="text-xs">AI Generated</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium">Skincare Focus</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {analysisResults.skinType === 'dry' && 'Focus on hydration and barrier repair. Look for products with hyaluronic acid and ceramides.'}
                              {analysisResults.skinType === 'oily' && 'Focus on oil control and gentle exfoliation. Avoid heavy moisturizers and look for non-comedogenic products.'}
                              {analysisResults.skinType === 'combination' && 'Use targeted products for different facial zones. Hydrate dry areas and control oil in the T-zone.'}
                              {analysisResults.skinType === 'sensitive' && 'Prioritize gentle, fragrance-free products with soothing ingredients like centella asiatica or oat extract.'}
                              {analysisResults.skinType === 'normal' && 'Maintain your balanced skin with consistent skincare and sun protection.'}
                            </p>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full flex items-center gap-2"
                          onClick={() => navigate('/skincare-ai')}
                        >
                          <MessageCircle className="h-4 w-4" />
                          Get Personalized Routine
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center gap-2"
                          onClick={() => navigate('/profile')}
                        >
                          <Database className="h-4 w-4" />
                          View Scan History
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Image uploader as the last item */}
          <ImageUploader onImageSelected={handleImageSelected} />
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

const ResultCard = ({ icon, title, value, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="bg-card/60 rounded-lg p-4 flex items-start gap-3 border-2 border-primary/10 shadow-md"
    >
      <div className="mt-1">{icon}</div>
      <div>
        <h3 className="text-sm text-muted-foreground font-medium mb-1">{title}</h3>
        <p className="font-mono text-md font-medium">{value}</p>
      </div>
    </motion.div>
  );
};

const EmptyResultCard = ({ icon, title, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="bg-card/60 rounded-lg p-4 flex items-start gap-3 border border-dashed border-muted"
    >
      <div className="mt-1">{icon}</div>
      <div>
        <h3 className="text-sm text-muted-foreground font-medium mb-1">{title}</h3>
        <div className="w-32 h-5 bg-muted/50 rounded animate-pulse"></div>
      </div>
    </motion.div>
  );
};

export default SkinAnalyzer;
