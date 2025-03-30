
import React from 'react';
import { motion } from 'framer-motion';
import { User, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import { CameraScanner } from '@/components/skin-analyzer/CameraScanner';
import { ScanResults } from '@/components/skin-analyzer/ScanResults';
import { ImageUploader } from '@/components/skin-analyzer/ImageUploader';
import { useSkinAnalysis } from '@/components/skin-analyzer/useSkinAnalysis';

const SkinAnalyzer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    analysisResults,
    analyzing,
    scanComplete,
    capturedImage,
    handleImageSelected,
    handleAnalysisComplete,
    setCapturedImage
  } = useSkinAnalysis(user);

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
