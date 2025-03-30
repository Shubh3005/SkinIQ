import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Bell, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HealthcareFormData {
  physician_name: string;
  physician_phone: string;
  morning_reminder: string;
  evening_reminder: string;
}

export const HealthcareInfoCard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<HealthcareFormData>({
    defaultValues: {
      physician_name: '',
      physician_phone: '',
      morning_reminder: '08:00',
      evening_reminder: '20:00',
    }
  });

  useEffect(() => {
    const fetchHealthcareInfo = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('physician_name, physician_phone, morning_reminder, evening_reminder')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching healthcare info:', error);
          toast.error('Failed to load healthcare information');
        } else if (data) {
          setValue('physician_name', data.physician_name || '');
          setValue('physician_phone', data.physician_phone || '');
          setValue('morning_reminder', data.morning_reminder || '08:00');
          setValue('evening_reminder', data.evening_reminder || '20:00');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHealthcareInfo();
  }, [user, setValue]);

  const onSubmit = async (formData: HealthcareFormData) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          physician_name: formData.physician_name,
          physician_phone: formData.physician_phone,
          morning_reminder: formData.morning_reminder,
          evening_reminder: formData.evening_reminder,
        })
        .eq('id', user.id);
      
      if (error) {
        toast.error('Failed to update healthcare information');
        console.error('Error updating healthcare info:', error);
      } else {
        toast.success('Healthcare information updated successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col border-2 border-primary/20 shadow-lg shadow-primary/10 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          Healthcare Information
        </CardTitle>
        <CardDescription>
          Manage your healthcare provider and routine reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form id="healthcare-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="physician_name" className="flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
              Physician Name
            </Label>
            <Input
              id="physician_name"
              placeholder="Dr. Jane Smith"
              {...register('physician_name')}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="physician_phone" className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              Physician Phone
            </Label>
            <Input
              id="physician_phone"
              placeholder="(555) 123-4567"
              {...register('physician_phone')}
              disabled={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="morning_reminder" className="flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                Morning Reminder
              </Label>
              <Input
                id="morning_reminder"
                type="time"
                {...register('morning_reminder')}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="evening_reminder" className="flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                Evening Reminder
              </Label>
              <Input
                id="evening_reminder"
                type="time"
                {...register('evening_reminder')}
                disabled={isLoading}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="border-t bg-muted/30">
        <Button 
          form="healthcare-form" 
          type="submit" 
          disabled={isLoading}
          className="w-full relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
          {isLoading ? 'Saving...' : 'Save Healthcare Information'}
        </Button>
      </CardFooter>
    </Card>
  );
};
