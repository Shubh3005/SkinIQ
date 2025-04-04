
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Scan, X, Zap, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';

interface CameraScannerProps {
  onAnalysisComplete: (results: any) => void;
  onScanImageCaptured?: (imageBase64: string) => void;
  user: any;
}

export const CameraScanner = ({ onAnalysisComplete, onScanImageCaptured, user }: CameraScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [scanComplete, setScanComplete] = useState(false);
  const [overlayContext, setOverlayContext] = useState<CanvasRenderingContext2D | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      setError(`Could not access camera: ${error.message}`);
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
    }
  };

  useEffect(() => stopCamera, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setAnalyzing(true);
      setAnalysisProgress(0);
      setError(null);

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
      console.log('Image base64 length:', imageBase64.length);
      
      if (onScanImageCaptured) {
        onScanImageCaptured(imageBase64);
      }
      
      setAnalysisStage('Analyzing skin features');
      setAnalysisProgress(50);

      try {
        // Call the FastAPI endpoint with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch('http://127.0.0.1:8000/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: imageBase64
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API response data:', data);
        
        setAnalysisProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Set the results from the API
        onAnalysisComplete(data);
        setScanComplete(true);
        toast.success("Analysis complete");

        // Save to Supabase if user is logged in
        if (user) {
          try {
            const { error: saveError } = await supabase.from('skin_scan_history').insert({
              user_id: user.id,
              skin_type: data.skinType,
              skin_issues: data.skinIssues,
              skin_tone: data.skinTone,
              scan_image: imageBase64,
              disease: data.disease || "No disease detected",
              acneSeverity: data.acneSeverity || "None"
            });
            
            if (saveError) {
              console.error('Error saving scan to history:', saveError);
            }
          } catch (error: any) {
            console.error('Error saving scan to history:', error);
          }
        }
      } catch (error: any) {
        console.error('Error analyzing image with FastAPI:', error);
        setError(`FastAPI analysis failed: ${error.message}`);
        toast.error(`Analysis failed: ${error.message || 'Connection to analysis server failed'}. Trying fallback...`);
        
        // Try fallback Supabase function if FastAPI fails
        try {
          setAnalysisStage('Trying alternative analysis method');
          setAnalysisProgress(60);
          
          const { data: mockData, error: mockError } = await supabase.functions.invoke('predict-mock', {
            body: {
              image: imageBase64
            }
          });

          if (mockError) {
            throw new Error(`Fallback API error: ${mockError.message}`);
          }

          console.log('Fallback API response:', mockData);
          setAnalysisProgress(100);
          onAnalysisComplete(mockData);
          setScanComplete(true);
          toast.success("Analysis complete (using fallback service)");
          
          // Still save to Supabase
          if (user) {
            try {
              const { error: saveError } = await supabase.from('skin_scan_history').insert({
                user_id: user.id,
                skin_type: mockData.skinType,
                skin_issues: mockData.skinIssues,
                skin_tone: mockData.skinTone,
                scan_image: imageBase64,
                disease: mockData.disease || "No disease detected",
                acneSeverity: mockData.acneSeverity || "None" 
              });
              
              if (saveError) {
                console.error('Error saving fallback scan to history:', saveError);
              }
            } catch (saveError: any) {
              console.error('Error saving fallback scan to history:', saveError);
            }
          }
        } catch (fallbackError: any) {
          console.error('Fallback analysis also failed:', fallbackError);
          setError(`All analysis methods failed: ${fallbackError.message}`);
          toast.error("All analysis methods failed. Please try again later.");
        }
      }
    } catch (e: any) {
      console.error('General error in camera capture:', e);
      setError(`Camera capture error: ${e.message}`);
      toast.error(`Camera error: ${e.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
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
          
          {/* Error message */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-card p-4 rounded-lg shadow-lg max-w-md text-center">
                <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-sm font-medium mb-2">{error}</p>
                <Button size="sm" onClick={() => setError(null)}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}
          
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
                <Camera className="mr-2 h-4 w-4" />
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
  );
};
