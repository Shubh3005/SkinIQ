
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Check, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';

interface ImageUploaderProps {
  onImageSelected?: (file: File) => void;
}

export const ImageUploader = ({ onImageSelected }: ImageUploaderProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    
    // Check file type
    if (!file.type.includes('image/')) {
      setError('Please select an image file');
      toast.error('Please select an image file');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large (max 5MB)');
      toast.error('Image too large (max 5MB)');
      return;
    }

    try {
      setLoading(true);
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
      
      if (onImageSelected) {
        onImageSelected(file);
      }
    } catch (error: any) {
      console.error('Error processing image:', error);
      setError(`Error processing image: ${error.message}`);
      toast.error(`Error processing image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeSelectedImage = () => {
    // Clean up the URL object to avoid memory leaks
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    
    setSelectedImage(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="border-2 border-primary/20 shadow-lg shadow-primary/10">
        <CardContent className="pt-6 pb-6">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        
          <div className="flex flex-col items-center justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="hidden"
              disabled={loading}
            />
            
            {!selectedImage ? (
              <div className="w-full">
                <div 
                  className={`border-2 border-dashed border-primary/40 rounded-lg p-12 cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors flex flex-col items-center justify-center ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={triggerFileInput}
                >
                  <Upload className="h-12 w-12 text-primary/50 mb-4" />
                  <p className="text-center text-muted-foreground">
                    Click to upload an image for skin analysis
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported formats: JPG, PNG (Max 5MB)
                  </p>
                </div>
                
                <Button
                  onClick={triggerFileInput}
                  className="w-full mt-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="w-full">
                <div className="relative">
                  <img 
                    src={selectedImage} 
                    alt="Uploaded skin" 
                    className="w-full h-auto max-h-[300px] object-contain rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeSelectedImage}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">
                      {selectedFile?.name.substring(0, 20)}
                      {(selectedFile?.name.length || 0) > 20 ? '...' : ''}
                    </span>
                  </p>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={triggerFileInput}
                    disabled={loading}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Change Image
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
