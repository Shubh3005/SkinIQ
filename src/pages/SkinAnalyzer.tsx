
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MessageCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import { CameraScanner } from '@/components/skin-analyzer/CameraScanner';
import { ScanResults } from '@/components/skin-analyzer/ScanResults';
import { ImageUploader } from '@/components/skin-analyzer/ImageUploader';
import { useSkinAnalysis } from '@/components/skin-analyzer/useSkinAnalysis';
import { toast } from 'sonner';

const SkinAnalyzer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    analysisResults,
    analyzing,
    scanComplete,
    capturedImage,
    error,
    handleImageSelected,
    handleAnalysisComplete,
    setCapturedImage
  } = useSkinAnalysis(user);

  // Check connectivity on component mount

  useEffect(() => {
    const checkFastAPI = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
  
        // Assuming capturedImage is the base64 string of your image
        const capturedImageBase64 = capturedImage; // Replace with the actual base64 string
  
        // Create the payload as JSON
        const payload = JSON.stringify({ image: capturedImageBase64 });
  
        const response = await fetch('http://127.0.0.1:8000/predict', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: payload,
          signal: controller.signal,
        }).catch(() => null);
  
        clearTimeout(timeoutId);
  
        if (!response || !response.ok) {
          console.warn('FastAPI is not available, will use fallback API');
          toast.warning("Skin analysis service is running in fallback mode. Some features may be limited.", {
            duration: 5000,
            id: "fastapi-warning"
          });
        } else {
          console.log('FastAPI is available');
        }
      } catch (error) {
        console.warn('FastAPI check failed:', error);
      }
    };
  
    checkFastAPI();
  }, []);
  

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

        {error && (
          <motion.div 
            className="w-full max-w-xl mx-auto mb-4 bg-destructive/10 border border-destructive rounded-lg p-4 flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">{error}</p>
              <p className="text-xs mt-1">Try using the image upload method instead or try again later.</p>
            </div>
          </motion.div>
        )}

        {/* Main content */}
        <div className="max-w-xl mx-auto w-full space-y-6">
          <div className="flex flex-col">
            <CameraScanner 
              onAnalysisComplete={handleAnalysisComplete}
              onScanImageCaptured={setCapturedImage}
              user={user}
            />
          </div>

          {/* Results section */}
          <ScanResults analysisResults={analysisResults} />

          {/* Image uploader */}
          <ImageUploader onImageSelected={handleImageSelected} />
        </div>
      </div>
    </div>
  );
};

export default SkinAnalyzer;
