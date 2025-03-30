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

  // ... (keep all the existing JSX rendering code) ...
};

// ... (keep the ResultCard and EmptyResultCard components) ...

export default SkinAnalyzer;