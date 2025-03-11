
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileFormData {
  full_name: string;
  skin_type: string;
}

const ProfileForm = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
        } else if (data) {
          setValue('full_name', data.full_name || '');
          setValue('skin_type', data.skin_type || '');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, setValue]);

  const onSubmit = async (formData: ProfileFormData) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          skin_type: formData.skin_type,
        })
        .eq('id', user.id);
      
      if (error) {
        toast.error('Failed to update profile');
        console.error('Error updating profile:', error);
      } else {
        toast.success('Profile updated successfully');
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
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          placeholder="Your full name"
          {...register('full_name', { required: 'Full name is required' })}
          disabled={isLoading}
        />
        {errors.full_name && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="skin_type">Skin Type</Label>
        <Select
          onValueChange={(value) => setValue('skin_type', value)}
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
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  );
};

export default ProfileForm;
