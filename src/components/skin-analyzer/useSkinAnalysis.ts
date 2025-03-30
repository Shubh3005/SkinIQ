
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useSkinAnalysis = (user: any) => {
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleImageSelected = async (file: File) => {
    try {
      setAnalyzing(true);
      
      // Convert the file to a data URL
      const reader = new FileReader();
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      setCapturedImage(imageBase64);
      await analyzeImage(imageBase64);
    } catch (error: any) {
      console.error('Upload analysis error:', error);
      toast.error(`Image preparation failed: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results);
    setScanComplete(true);
  };

  const analyzeImage = async (imageBase64: string) => {
    try {
      console.log('Sending request to prediction API...');

      // Call the external API with more robust error handling
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
      
      // Set the results from the API
      handleAnalysisComplete(data);
      
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
      
      // Try fallback API
      try {
        console.log('Trying fallback API...');
        const fallbackResponse = await fetch('https://tbeyfafaieibqspwiwlc.supabase.co/functions/v1/predict-mock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: imageBase64
          }),
        });

        if (!fallbackResponse.ok) {
          throw new Error(`Fallback API error: ${fallbackResponse.status}`);
        }

        const fallbackData = await fallbackResponse.json();
        handleAnalysisComplete(fallbackData);
        toast.success("Analysis complete (using fallback service)");
      } catch (fallbackError) {
        console.error('Fallback analysis also failed:', fallbackError);
        toast.error("All analysis methods failed. Please try again later.");
      }
    }
  };

  return {
    analysisResults,
    analyzing,
    scanComplete,
    capturedImage,
    handleImageSelected,
    handleAnalysisComplete,
    setCapturedImage
  };
};
