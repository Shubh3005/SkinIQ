
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

  // ... (keep all the existing useEffect hooks and camera control functions) ...

  const analyzeImage = async (imageData: string | Blob) => {
    setAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      const formData = new FormData();
      
      // Convert data URL to Blob if needed
      let imageBlob: Blob;
      if (typeof imageData === 'string') {
        const response = await fetch(imageData);
        imageBlob = await response.blob();
      } else {
        imageBlob = imageData;
      }
      
      formData.append('file', imageBlob, 'skin-analysis.jpg');
      
      // Start the progress simulation
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);
      
      setAnalysisStage('Sending image for analysis...');
      
      console.log('black')
      const response = await fetch('https://236d-104-39-9-82.ngrok-free.app/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Map the API response to our expected format
      const processedResults = {
        skinType: data.skin_type || 'unknown',
        skinIssues: data.skin_issues || 'None detected',
        sunDamage: data.sun_damage || 'None detected',
        uniqueFeature: data.unique_feature || 'None detected',
        skinTone: data.skin_tone || 'Not analyzed',
        // Include any additional fields from the API
        ...data
      };
      
      // Save to history if user is logged in
      if (user) {
        try {
          const imageUrl = typeof imageData === 'string' ? imageData : URL.createObjectURL(imageData);
          
          await supabase.functions.invoke('skincare-history', {
            body: {
              action: 'save-scan',
              data: {
                skinType: processedResults.skinType,
                skinIssues: processedResults.skinIssues,
                sunDamage: processedResults.sunDamage,
                uniqueFeature: processedResults.uniqueFeature,
                skinTone: processedResults.skinTone,
                scanImage: imageUrl,
                rawApiResponse: data // Store the full API response if needed
              }
            }
          });
        } catch (error) {
          console.error('Error saving scan to history:', error);
        }
      }
      
      setAnalysisResults(processedResults);
      setScanComplete(true);
      toast.success("Analysis complete");
      
      return processedResults;
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error("Analysis failed. Please try again.");
      // Fallback to simulated results if API fails
      return simulateFallbackAnalysis();
    } finally {
      setAnalyzing(false);
    }
  };

  const simulateFallbackAnalysis = async () => {
    // This is a fallback in case the API fails
    const skinTypes = ['normal', 'dry', 'oily', 'combination', 'sensitive'];
    const skinIssuesOptions = [
      'Minor acne detected in T-zone',
      'Slight dryness detected in cheek area',
      'Some oil imbalance detected',
      'Areas of mild irritation detected',
      'No major issues detected'
    ];
    const sunDamageOptions = [
      'Minimal signs of UV exposure',
      'Light sun damage detected',
      'Moderate UV exposure signs',
      'None detected'
    ];
    const skinToneOptions = ['Light', 'Medium', 'Dark', 'Very Light', 'Olive', 'Deep'];
    const uniqueFeatureOptions = [
      'Excellent hydration levels',
      'Strong skin barrier',
      'Good elasticity',
      'Even texture',
      'None detected'
    ];
    
    const results = {
      skinType: skinTypes[Math.floor(Math.random() * skinTypes.length)],
      skinIssues: skinIssuesOptions[Math.floor(Math.random() * skinIssuesOptions.length)],
      sunDamage: sunDamageOptions[Math.floor(Math.random() * sunDamageOptions.length)],
      skinTone: skinToneOptions[Math.floor(Math.random() * skinToneOptions.length)],
      uniqueFeature: uniqueFeatureOptions[Math.floor(Math.random() * uniqueFeatureOptions.length)]
    };
    
    setAnalysisResults(results);
    setScanComplete(true);
    toast("Using simulated results", {
      description: "The analysis API didn't respond, showing simulated results",
    });
    
    return results;
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      await analyzeImage(imageData);
    } catch (error) {
      console.error('Error capturing image:', error);
      toast.error("Failed to capture image");
    }
  };

  const handleImageSelected = async (file: File) => {
    try {
      toast.info("Uploading image for analysis...");
      await analyzeImage(file);
    } catch (error) {
      console.error('Error handling image upload:', error);
      toast.error("Failed to upload image");
    }
  };

  // Adding the missing return statement with JSX
  return (
    <div className="min-h-screen bg-slate-50">
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <h1 className="text-2xl font-bold">Skin Analyzer</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1"
          >
            <User className="h-4 w-4" />
            Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CameraIcon className="h-5 w-5 text-primary" />
                  Upload or Capture an Image
                </h2>
                
                <ImageUploader onImageSelected={handleImageSelected} />
                
                {analyzing && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{analysisStage}</span>
                      <span className="text-sm font-medium">{Math.round(analysisProgress)}%</span>
                    </div>
                    <Progress value={analysisProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {analysisResults ? (
              <Card className="shadow-md border-primary/20">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Scan className="h-5 w-5 text-primary" />
                    Analysis Results
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-100 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplet className="h-4 w-4 text-blue-500" />
                        <h3 className="font-medium">Skin Type</h3>
                      </div>
                      <p className="text-slate-700 capitalize">{analysisResults.skinType}</p>
                    </div>
                    
                    <div className="bg-slate-100 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        <h3 className="font-medium">Skin Issues</h3>
                      </div>
                      <p className="text-slate-700">{analysisResults.skinIssues}</p>
                    </div>
                    
                    <div className="bg-slate-100 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="h-4 w-4 text-yellow-500" />
                        <h3 className="font-medium">Sun Damage</h3>
                      </div>
                      <p className="text-slate-700">{analysisResults.sunDamage}</p>
                    </div>
                    
                    <div className="bg-slate-100 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <h3 className="font-medium">Unique Feature</h3>
                      </div>
                      <p className="text-slate-700">{analysisResults.uniqueFeature}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-300">
                      <Palette className="h-3 w-3 mr-1" />
                      {analysisResults.skinTone || "Skin Tone N/A"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setScanComplete(false);
                        setAnalysisResults(null);
                      }}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      New Scan
                    </Button>
                    
                    <Button
                      onClick={() => navigate('/skincare-ai')}
                      className="flex items-center gap-1"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Get Personalized Advice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center bg-slate-50 border-dashed border-2 border-slate-200">
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Scan className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">No Analysis Yet</h3>
                    <p className="text-slate-500 max-w-xs">
                      Upload or capture an image of your face to receive a detailed skin analysis
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkinAnalyzer;
