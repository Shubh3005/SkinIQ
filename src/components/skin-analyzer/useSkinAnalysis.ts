
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useSkinAnalysis = (user: any) => {
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (file: File) => {
    try {
      setAnalyzing(true);
      setError(null);
      
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
      setError(`Image preparation failed: ${error.message || 'Unknown error occurred'}`);
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
    let usedFallback = false;
    
    try {
      console.log('Sending request to FastAPI prediction service...');
      console.log('Image base64 length:', imageBase64.length);
      
      // Extract only the base64 data part without the prefix
      const base64Data = imageBase64.split(',')[1];
      console.log('Base64 data length (without prefix):', base64Data.length);

      // Call the FastAPI endpoint with robust error handling
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64
        }),
        // Set a timeout to handle connection issues
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      
      // Set the results from the API
      handleAnalysisComplete(data);
      toast.success("Analysis complete");
      
      // Save the scan results to Supabase if user is logged in
      if (user) {
        try {
          console.log('Saving scan results to Supabase...');
          
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
            toast.error(`Error saving scan to history: ${saveError.message}`);
          } else {
            console.log('Scan saved successfully');
          }
        } catch (error: any) {
          console.error('Error saving scan to history:', error);
          toast.error(`Error saving scan: ${error.message}`);
        }
      } else {
        console.log('User not logged in, scan history not saved');
      }
    } catch (error: any) {
      console.error('API fetch error:', error);
      setError(`Connection to analysis server failed: ${error.message}`);
      toast.error(`Image analysis failed: ${error.message || 'Connection to analysis server failed'}`);
      
      // Try fallback API
      try {
        console.log('FastAPI connection failed. Trying Supabase fallback API...');
        usedFallback = true;
        const fallbackResponse = await supabase.functions.invoke('predict-mock', {
          body: {
            image: imageBase64
          }
        });

        if (fallbackResponse.error) {
          throw new Error(`Fallback API error: ${fallbackResponse.error.message}`);
        }

        console.log('Fallback API response:', fallbackResponse.data);
        handleAnalysisComplete(fallbackResponse.data);
        toast.success("Analysis complete (using fallback service)");
      } catch (fallbackError: any) {
        console.error('Fallback analysis also failed:', fallbackError);
        setError(`All analysis methods failed. Please try again later: ${fallbackError.message}`);
        toast.error("All analysis methods failed. Please try again later.");
      }
    }
  };

  return {
    analysisResults,
    analyzing,
    scanComplete,
    capturedImage,
    error,
    handleImageSelected,
    handleAnalysisComplete,
    setCapturedImage
  };
};
