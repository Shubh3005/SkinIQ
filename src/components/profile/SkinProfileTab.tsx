
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Droplet, Palette } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SkinProfileFormData {
  skin_type: string;
  skin_tone: string;
}

const skinTypes = [
  { value: 'normal', label: 'Normal' },
  { value: 'dry', label: 'Dry' },
  { value: 'oily', label: 'Oily' },
  { value: 'combination', label: 'Combination' },
  { value: 'sensitive', label: 'Sensitive' }
];

const skinTones = [
  { value: 'very_light', label: 'Very Light' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'olive', label: 'Olive' },
  { value: 'tan', label: 'Tan' },
  { value: 'deep', label: 'Deep' },
  { value: 'dark', label: 'Dark' },
  { value: 'very_dark', label: 'Very Dark' }
];

export const SkinProfileTab = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<SkinProfileFormData>({
    defaultValues: {
      skin_type: '',
      skin_tone: ''
    }
  });

  useEffect(() => {
    const fetchSkinProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('skin_type, skin_tone')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching skin profile:', error);
          toast.error('Failed to load skin profile data');
        } else if (data) {
          // Safely access properties with optional chaining
          form.setValue('skin_type', data.skin_type || '');
          form.setValue('skin_tone', data.skin_tone || '');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSkinProfile();
  }, [user, form]);

  const onSubmit = async (formData: SkinProfileFormData) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          skin_type: formData.skin_type,
          skin_tone: formData.skin_tone
        })
        .eq('id', user.id);
      
      if (error) {
        toast.error('Failed to update skin profile');
        console.error('Error updating skin profile:', error);
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
    <Card className="border-2 border-primary/20 shadow-lg shadow-primary/10">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="skin_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-primary" />
                    Skin Type
                  </FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your skin type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {skinTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skin_tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    Skin Tone
                  </FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your skin tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {skinTones.map(tone => (
                        <SelectItem key={tone.value} value={tone.value}>{tone.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Saving...' : 'Save Skin Profile'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
