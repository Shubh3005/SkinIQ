import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  Camera, 
  Droplet, 
  ShieldCheck, 
  Sun, 
  Sparkles, 
  Palette, 
  Scan, 
  User, 
  X, 
  Zap, 
  Loader2, 
  Sliders, 
  Camera as CameraIcon, 
  Lightbulb, 
  Database,
  MessageCircle,
  AlertTriangle,
  BarChart
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [scanComplete, setScanComplete] = useState(false);
  const [overlayContext, setOverlayContext] = useState<CanvasRenderingContext2D | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

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
    
    let animationFrame: number;
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

        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(cornerOffset, 0);
        ctx.lineTo(cornerOffset, cornerSize);
        ctx.lineTo(0, cornerSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, cornerOffset);
        ctx.lineTo(cornerSize, cornerOffset);
        ctx.lineTo(cornerSize, 0);
        ctx.stroke();

        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(canvas.width - cornerOffset, 0);
        ctx.lineTo(canvas.width - cornerOffset, cornerSize);
        ctx.lineTo(canvas.width, cornerSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(canvas.width, cornerOffset);
        ctx.lineTo(canvas.width - cornerSize, cornerOffset);
        ctx.lineTo(canvas.width - cornerSize, 0);
        ctx.stroke();

        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(cornerOffset, canvas.height);
        ctx.lineTo(cornerOffset, canvas.height - cornerSize);
        ctx.lineTo(0, canvas.height - cornerSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, canvas.height - cornerOffset);
        ctx.lineTo(cornerSize, canvas.height - cornerOffset);
        ctx.lineTo(cornerSize, canvas.height);
        ctx.stroke();

        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(canvas.width - cornerOffset, canvas.height);
        ctx.lineTo(canvas.width - cornerOffset, canvas.height - cornerSize);
        ctx.lineTo(canvas.width, canvas.height - cornerSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(canvas.width, canvas.height - cornerOffset);
        ctx.lineTo(canvas.width - cornerSize, canvas.height - cornerOffset);
        ctx.lineTo(canvas.width - cornerSize, canvas.height);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(120, 226, 160, 0.2)';
        ctx.fillRect(0, scanLine, canvas.width, scanSpeed);
        
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
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      setScanComplete(false);
      setAnalysisResults(null);
    }
  };

  useEffect(() => stopCamera, []);

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

      setAnalysisStage('Preparing image for analysis');
      setAnalysisProgress(20);
      
      // Convert canvas to base64
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
      
      setAnalysisStage('Analyzing skin features');
      setAnalysisProgress(50);

      // Call the external API - using fetch with error handling
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      setAnalysisProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Set the results from the API
      setAnalysisResults(data);
      setScanComplete(true);
      toast.success("Analysis complete");

      if (user) {
        try {
          await supabase.functions.invoke('skincare-history', {
            body: {
              action: 'save-scan',
              data: {
                ...data,
                scanImage: imageBase64
              }
            }
          });
        } catch (error) {
          console.error('Error saving scan to history:', error);
        }
      }
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      toast.error(`Analysis failed: ${error.message || 'Connection to analysis server failed'}. Please try again.`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageSelected = async (file: File) => {
    try {
      setAnalyzing(true);
      setAnalysisProgress(0);
      
      setAnalysisStage('Processing uploaded image');
      setAnalysisProgress(30);

      // Convert the file to a data URL
      const reader = new FileReader();
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      setAnalysisStage('Analyzing skin features');
      setAnalysisProgress(60);

      console.log('Sending request to prediction API...');

      // Call the external API with more robust error handling
      try {
        const response = await fetch('http://127.0.0.1:8000/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: imageBase64
          }),
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('API response data:', data);
        
        setAnalysisProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set the results from the API
        setAnalysisResults(data);
        setScanComplete(true);
        toast.success("Analysis complete");

        if (user) {
          try {
            await supabase.functions.invoke('skincare-history', {
              body: {
                action: 'save-scan',
                data: {
                  ...data,
                  scanImage: imageBase64
                }
              }
            });
          } catch (error) {
            console.error('Error saving scan to history:', error);
          }
        }
      } catch (error: any) {
        console.error('API fetch error:', error);
        toast.error(`Image analysis failed: ${error.message || 'Connection to analysis server failed'}`);
      }
    } catch (error: any) {
      console.error('Upload analysis error:', error);
      toast.error(`Image preparation failed: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setAnalyzing(false);
    }
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

        {/* Main content */}
        <div className="max-w-xl mx-auto w-full space-y-6">
          <div className="flex flex-col">
            <Card className="w-full h-full flex flex-col border-2 border-primary/20 shadow-lg shadow-primary/10 overflow-hidden">
              <CardContent className="flex-1 p-6 pt-12 flex flex-col items-center justify-center relative">
                {/* Hidden canvas for capturing images */}
                <canvas 
                  ref={canvasRef}
                  className="hidden"
                />

                {/* Camera preview and overlay */}
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
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
                  
                  {/* Analysis progress */}
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

                {/* Control buttons */}
                <AnimatePresence mode="wait">
                  {!cameraActive && !scanComplete ? (
                    <motion.div key="start-button">
                      <Button onClick={startCamera}>
                        <CameraIcon className="mr-2 h-4 w-4" />
                        Activate Skin Scanner
                      </Button>
                    </motion.div>
                  ) : cameraActive && !analyzing && !scanComplete ? (
                    <motion.div key="scan-button">
                      <Button onClick={captureAndAnalyze}>
                        <Scan className="mr-2 h-4 w-4" />
                        Start Skin Analysis
                      </Button>
                    </motion.div>
                  ) : analyzing ? (
                    <motion.div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-sm">Advanced analysis in progress...</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Results section */}
          <Card className="border-2 border-primary/20 shadow-lg shadow-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Skin Analysis</h2>
                </div>
                <Badge variant="outline" className="text-xs">
                  {analysisResults ? "COMPLETE" : "READY"}
                </Badge>
              </div>

              <div className="space-y-4">
                {analysisResults ? (
                  <>
                    <ResultCard 
                      icon={<Droplet className="h-5 w-5 text-blue-400" />}
                      title="Skin Type"
                      value={analysisResults.skinType}
                    />
                    <ResultCard 
                      icon={<Palette className="h-5 w-5 text-green-400" />}
                      title="Skin Tone"
                      value={analysisResults.skinTone}
                    />
                    <ResultCard 
                      icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                      title="Skin Issues"
                      value={analysisResults.skinIssues}
                    />
                    <ResultCard 
                      icon={<Sun className="h-5 w-5 text-amber-400" />}
                      title="Sun Damage"
                      value={analysisResults.sunDamage}
                    />
                    <ResultCard 
                      icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
                      title="Possible Disease"
                      value={analysisResults.disease || "No disease detected"}
                    />
                    <ResultCard 
                      icon={<BarChart className="h-5 w-5 text-purple-400" />}
                      title="Acne Severity"
                      value={analysisResults.acneSeverity || "None"}
                    />
                  </>
                ) : (
                  // Show empty state cards when no results
                  Array.from({ length: 6 }).map((_, index) => (
                    <EmptyResultCard
                      key={index}
                      icon={[
                        <Droplet />,
                        <Palette />,
                        <ShieldCheck />,
                        <Sun />,
                        <AlertTriangle />,
                        <BarChart />
                      ][index]}
                      title={[
                        "Skin Type",
                        "Skin Tone",
                        "Skin Issues",
                        "Sun Damage",
                        "Possible Disease",
                        "Acne Severity"
                      ][index]}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Image uploader */}
          <ImageUploader onImageSelected={handleImageSelected} />
        </div>
      </div>
    </div>
  );
};

// Helper components
const ResultCard = ({ icon, title, value, delay = 0 }: { 
  icon: React.ReactNode;
  title: string;
  value: string;
  delay?: number;
}) => (
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

const EmptyResultCard = ({ icon, title, delay = 0 }: { 
  icon: React.ReactNode;
  title: string;
  delay?: number;
}) => (
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

export default SkinAnalyzer;
