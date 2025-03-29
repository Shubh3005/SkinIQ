
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, ScanFace, Eye, Sparkles, Shield, SunIcon, Fingerprint, Cpu, Activity, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';

type ScanStatus = 'idle' | 'scanning' | 'analyzing' | 'complete';
type ScanResult = {
  skinType?: string;
  skinIssues?: string[];
  sunDamage?: 'low' | 'moderate' | 'high';
  uniqueFeatures?: string[];
  skinTone?: string;
  confidence?: number;
}

const SkinAnalysis = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<ScanResult | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Face detection overlay coordinates
  const [faceBox, setFaceBox] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  
  // Camera stream initialization
  useEffect(() => {
    if (cameraActive && videoRef.current) {
      const enableCamera = async () => {
        try {
          const constraints = {
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            }
          };
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          
          // Simulate face detection after a short delay
          setTimeout(() => {
            simulateFaceDetection();
          }, 1500);
          
        } catch (err) {
          console.error('Error accessing camera:', err);
          toast.error('Could not access camera. Please check permissions.');
          setCameraActive(false);
        }
      };
      
      enableCamera();
      
      // Cleanup function
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
      };
    }
  }, [cameraActive]);
  
  // Simulate face detection - in a real app, you'd use a face-detection library
  const simulateFaceDetection = () => {
    if (videoRef.current) {
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      // Simulate finding a face in the center 
      setFaceBox({
        x: videoWidth * 0.25,
        y: videoHeight * 0.15,
        width: videoWidth * 0.5,
        height: videoHeight * 0.7,
      });
      
      setFaceDetected(true);
    }
  };
  
  // Start camera feed
  const handleStartCamera = () => {
    setCameraActive(true);
  };
  
  // Start skin analysis scan
  const handleStartScan = () => {
    if (!faceDetected) {
      toast.warning('Please position your face in the camera');
      return;
    }
    
    setScanStatus('scanning');
    
    // Simulate scanning progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setScanProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setScanStatus('analyzing');
        setAnalyzing(true);
        
        // Simulate analysis
        setTimeout(() => {
          captureFrame();
          setScanStatus('complete');
          setAnalyzing(false);
          
          // Mock results - in a real app, these would come from your AI model
          setScanResults({
            skinType: 'Combination',
            skinIssues: ['Mild Hyperpigmentation', 'Occasional Dryness'],
            sunDamage: 'low',
            uniqueFeatures: ['Even Texture', 'Good Elasticity'],
            skinTone: 'Medium (Type III)',
            confidence: 92.6
          });
        }, 3000);
      }
    }, 120);
  };
  
  // Capture frame when scan completes
  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    }
  };
  
  // Reset analysis
  const handleReset = () => {
    setScanStatus('idle');
    setScanProgress(0);
    setScanResults(null);
    setFaceDetected(false);
    setAnalyzing(false);
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Background & Header */}
      <AnimatedBackground />
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-6"
        >
          <Logo size="md" />
          <h1 className="text-2xl md:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
            SkinIQ Analysis
          </h1>
        </motion.div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Camera View & Scan Interface - Spans 3 columns */}
          <div className="lg:col-span-3 rounded-xl overflow-hidden bg-black/30 backdrop-blur-md border border-white/20 shadow-xl">
            <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/30">
              {/* Camera Feed or Placeholder */}
              {cameraActive ? (
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  playsInline 
                  muted
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Camera className="w-20 h-20 text-indigo-300 mb-4 opacity-50" />
                  <p className="text-white/70 text-center max-w-md px-6">
                    Enable your camera to analyze your skin condition with our advanced AI
                  </p>
                </div>
              )}
              
              {/* Face Detection Overlay */}
              {faceDetected && cameraActive && (
                <svg 
                  className="absolute top-0 left-0 w-full h-full"
                  viewBox={`0 0 ${videoRef.current?.videoWidth || 1280} ${videoRef.current?.videoHeight || 720}`}
                  style={{ overflow: 'visible' }}
                >
                  <motion.rect
                    x={faceBox.x}
                    y={faceBox.y}
                    width={faceBox.width}
                    height={faceBox.height}
                    rx="20"
                    fill="none"
                    stroke="rgba(138, 75, 255, 0.8)"
                    strokeWidth="2"
                    strokeDasharray="10,10"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ 
                      strokeDashoffset: [100, 0],
                      stroke: ['rgba(138, 75, 255, 0.8)', 'rgba(255, 75, 232, 0.8)']
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                  />
                  
                  {/* Corner detection points */}
                  {[
                    { x: faceBox.x, y: faceBox.y }, // Top left
                    { x: faceBox.x + faceBox.width, y: faceBox.y }, // Top right
                    { x: faceBox.x, y: faceBox.y + faceBox.height }, // Bottom left
                    { x: faceBox.x + faceBox.width, y: faceBox.y + faceBox.height } // Bottom right
                  ].map((point, i) => (
                    <motion.circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r="5"
                      fill="rgba(255, 255, 255, 0.8)"
                      initial={{ scale: 0.5, opacity: 0.5 }}
                      animate={{ 
                        scale: [0.5, 1.2, 0.5], 
                        opacity: [0.5, 1, 0.5],
                        fill: ['rgba(138, 75, 255, 0.8)', 'rgba(255, 75, 232, 0.8)'] 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        delay: i * 0.2 
                      }}
                    />
                  ))}
                </svg>
              )}
              
              {/* Scanning Animation Overlay */}
              {scanStatus === 'scanning' && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-purple-600/10 flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div 
                    className="w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    initial={{ y: 0, opacity: 0.7 }}
                    animate={{ y: ['0%', '100%', '0%'], opacity: [0.7, 1, 0.7] }}
                    transition={{ 
                      y: { duration: 3, repeat: Infinity, ease: "linear" },
                      opacity: { duration: 3, repeat: Infinity }
                    }}
                  />
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <Progress value={scanProgress} className="h-2 bg-white/20" indicatorClassName="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                    <p className="text-white mt-2 text-sm font-medium">Scanning: {scanProgress}%</p>
                  </div>
                </motion.div>
              )}
              
              {/* Analysis Animation */}
              {scanStatus === 'analyzing' && (
                <motion.div 
                  className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="flex items-center gap-3 bg-black/40 px-6 py-3 rounded-full border border-indigo-500/30 shadow-lg shadow-indigo-500/20"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Cpu className="h-5 w-5 text-indigo-400" />
                    </motion.div>
                    <span className="text-white/90 font-semibold tracking-wide">Analyzing skin data...</span>
                  </motion.div>
                </motion.div>
              )}
            </div>
            
            {/* Scan Controls */}
            <div className="p-4 flex flex-wrap gap-4">
              {!cameraActive && (
                <Button 
                  onClick={handleStartCamera} 
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-none"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Enable Camera
                </Button>
              )}
              
              {cameraActive && scanStatus === 'idle' && (
                <Button 
                  onClick={handleStartScan} 
                  disabled={!faceDetected}
                  className={cn(
                    "flex-1 text-white border-none",
                    faceDetected 
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700" 
                      : "bg-gray-700"
                  )}
                >
                  <ScanFace className="mr-2 h-4 w-4" />
                  {faceDetected ? "Start Skin Analysis" : "Position Your Face"}
                </Button>
              )}
              
              {scanStatus === 'complete' && (
                <Button 
                  onClick={handleReset} 
                  className="flex-1 bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 text-white border-none"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  New Analysis
                </Button>
              )}
            </div>
          </div>
          
          {/* Results Panel - Spans 2 columns */}
          <div className="lg:col-span-2 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                  Skin Analysis Results
                </span>
              </h2>
              
              {scanStatus !== 'complete' ? (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <Eye className="h-10 w-10 text-indigo-300/50" />
                  </div>
                  <p className="text-white/70 max-w-xs">
                    {scanStatus === 'idle' 
                      ? "Complete a skin scan to view your detailed analysis" 
                      : scanStatus === 'scanning'
                        ? "Scanning your skin profile..."
                        : "Processing your skin data with our AI..."}
                  </p>
                </div>
              ) : scanResults && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Confidence Score */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70 text-sm">Analysis Confidence</span>
                    <span className="text-indigo-400 font-bold">{scanResults.confidence}%</span>
                  </div>
                  <Progress value={scanResults.confidence} className="h-2 mb-6 bg-white/20" indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500" />
                  
                  {/* Result Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Skin Type */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Fingerprint className="h-4 w-4 text-indigo-400" />
                        <h3 className="text-white/90 font-semibold">Skin Type</h3>
                      </div>
                      <p className="text-white/80 text-lg">{scanResults.skinType}</p>
                    </div>
                    
                    {/* Skin Tone */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-purple-400" />
                        <h3 className="text-white/90 font-semibold">Skin Tone</h3>
                      </div>
                      <p className="text-white/80 text-lg">{scanResults.skinTone}</p>
                    </div>
                    
                    {/* Sun Damage */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <SunIcon className="h-4 w-4 text-amber-400" />
                        <h3 className="text-white/90 font-semibold">Sun Damage</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              scanResults.sunDamage === 'low' ? "w-1/3 bg-green-500" :
                              scanResults.sunDamage === 'moderate' ? "w-2/3 bg-amber-500" :
                              "w-full bg-red-500"
                            )} 
                          />
                        </div>
                        <span className="text-white/80 capitalize">{scanResults.sunDamage}</span>
                      </div>
                    </div>
                    
                    {/* Skin Issues */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-pink-400" />
                        <h3 className="text-white/90 font-semibold">Skin Issues</h3>
                      </div>
                      <ul className="text-white/80 space-y-1">
                        {scanResults.skinIssues?.map((issue, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Unique Features */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                      <h3 className="text-white/90 font-semibold">Unique Features</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scanResults.uniqueFeatures?.map((feature, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1 rounded-full text-sm bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-white/80"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Hidden canvas for capturing the final image */}
                  <canvas ref={canvasRef} className="hidden" />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkinAnalysis;
