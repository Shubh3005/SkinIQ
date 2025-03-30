
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SkinProfileFormData {
  skin_type: string;
  skin_tone: string;
}

export const SkinProfileTab = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SkinProfileFormData>();
  const skinType = watch('skin_type');
  const skinTone = watch('skin_tone');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('skin_type, skin_tone')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          toast.error('Failed to load profile data');
        } else if (data) {
          setValue('skin_type', data.skin_type || '');
          setValue('skin_tone', data.skin_tone || '');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, setValue]);

  const onSubmit = async (formData: SkinProfileFormData) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          skin_type: formData.skin_type,
          skin_tone: formData.skin_tone,
        })
        .eq('id', user.id);
      
      if (error) {
        toast.error('Failed to update profile');
        console.error('Error updating profile:', error);
      } else {
        toast.success('Skin profile updated successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="skin_type">Skin Type</Label>
        <Select
          onValueChange={(value) => setValue('skin_type', value)}
          value={skinType}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your skin type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="dry">Dry</SelectItem>
            <SelectItem value="oily">Oily</SelectItem>
            <SelectItem value="combination">Combination</SelectItem>
            <SelectItem value="sensitive">Sensitive</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Your skin type helps us recommend appropriate skincare products and routines.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="skin_tone">Skin Tone</Label>
        <Select
          onValueChange={(value) => setValue('skin_tone', value)}
          value={skinTone}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your skin tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="very_fair">Very Fair</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="olive">Olive</SelectItem>
            <SelectItem value="tan">Tan</SelectItem>
            <SelectItem value="deep">Deep</SelectItem>
            <SelectItem value="very_deep">Very Deep</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Your skin tone helps us suggest products that work well with your complexion.
        </p>
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Skin Profile'}
      </Button>
    </form>
  );
};
