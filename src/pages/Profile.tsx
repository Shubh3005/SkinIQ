
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useToast } from "@/hooks/use-toast";
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { UserProfileCard } from '@/components/profile/UserProfileCard';
import { HistoryCard } from '@/components/profile/HistoryCard';
import { HealthcareInfoCard } from '@/components/profile/HealthcareInfoCard';
import RoutineCalendar from '@/components/RoutineCalendar';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [scanHistory, setScanHistory] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isMorningCompleted, setIsMorningCompleted] = useState(false);
  const [isEveningCompleted, setIsEveningCompleted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setLoadingHistory(true);
      try {
        const { data: scans, error: scanError } = await supabase
          .from('skin_scan_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (scanError) {
          console.error("Error fetching scan history:", scanError);
          toast({
            title: "Error",
            description: "Failed to load scan history.",
            variant: "destructive",
          });
        } else {
          setScanHistory(scans || []);
        }

        const { data: chats, error: chatError } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (chatError) {
          console.error("Error fetching chat history:", chatError);
          toast({
            title: "Error",
            description: "Failed to load chat history.",
            variant: "destructive",
          });
        } else {
          setChatHistory(chats || []);
        }
      } catch (error) {
        console.error("Unexpected error fetching history:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading history.",
          variant: "destructive",
        });
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [user, toast]);

  // Check if the selected date is today's routine status
  useEffect(() => {
    const checkTodayRoutine = async () => {
      if (!user || !selectedDate) return;
      
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const { data, error } = await supabase
          .from('routine_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', formattedDate)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching routine logs:', error);
          return;
        }
        
        setIsMorningCompleted(data?.morning_completed || false);
        setIsEveningCompleted(data?.evening_completed || false);
      } catch (error) {
        console.error('Error checking routine status:', error);
      }
    };
    
    checkTodayRoutine();
  }, [user, selectedDate]);

  const handleRoutineClick = async (type: 'morning' | 'evening') => {
    if (!user) return;
    
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    
    if (!isToday) {
      toast({
        title: "Cannot update past days",
        description: "You can only mark routines for today",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const { data: existingLog } = await supabase
        .from('routine_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', formattedDate)
        .maybeSingle();
      
      if (existingLog) {
        // Toggle the completed status
        const updatedValue = type === 'morning' 
          ? !existingLog.morning_completed 
          : !existingLog.evening_completed;
          
        await supabase
          .from('routine_logs')
          .update({
            [type === 'morning' ? 'morning_completed' : 'evening_completed']: updatedValue
          })
          .eq('id', existingLog.id);
          
        if (type === 'morning') {
          setIsMorningCompleted(updatedValue);
        } else {
          setIsEveningCompleted(updatedValue);
        }
      } else {
        // Create new log
        const newLog = {
          user_id: user.id,
          date: formattedDate,
          morning_completed: type === 'morning',
          evening_completed: type === 'evening'
        };
        
        await supabase.from('routine_logs').insert(newLog);
        
        if (type === 'morning') {
          setIsMorningCompleted(true);
        } else {
          setIsEveningCompleted(true);
        }
      }
      
      toast({
        title: "Routine updated",
        description: `Your ${type} routine has been marked as ${type === 'morning' ? (isMorningCompleted ? 'incomplete' : 'complete') : (isEveningCompleted ? 'incomplete' : 'complete')}!`
      });
    } catch (error) {
      console.error('Error updating routine:', error);
      toast({
        title: "Error",
        description: "Failed to update routine",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <AnimatedBackground />

      <div className="w-full max-w-screen-xl px-6 py-8 mx-auto flex-1 flex flex-col">
        <ProfileHeader />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold">
            Your <span className="text-primary">Profile</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and view your skin history
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto w-full mb-8">
          <div className="flex flex-col gap-8">
            <UserProfileCard />
            <HealthcareInfoCard />
          </div>
          <div className="flex flex-col gap-8">
            <div className="bg-muted/40 backdrop-blur-sm rounded-lg p-4 border border-border">
              <h3 className="font-semibold mb-3">{format(selectedDate || new Date(), 'MMMM d, yyyy')} Routine</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <Star className="h-4 w-4 text-amber-600" />
                    </div>
                    <span>Morning Routine</span>
                  </div>
                  <Button 
                    variant={isMorningCompleted ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => handleRoutineClick('morning')} 
                    disabled={!user}
                    className={isMorningCompleted ? "bg-amber-500 hover:bg-amber-600" : ""}
                  >
                    {isMorningCompleted ? "Completed" : "Mark Complete"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Star className="h-4 w-4 text-blue-600" />
                    </div>
                    <span>Evening Routine</span>
                  </div>
                  <Button 
                    variant={isEveningCompleted ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => handleRoutineClick('evening')} 
                    disabled={!user}
                    className={isEveningCompleted ? "bg-blue-500 hover:bg-blue-600" : ""}
                  >
                    {isEveningCompleted ? "Completed" : "Mark Complete"}
                  </Button>
                </div>
              </div>
            </div>
            <RoutineCalendar variant="simple" onDateSelect={setSelectedDate} />
            <HistoryCard 
              scanHistory={scanHistory}
              chatHistory={chatHistory}
              loadingHistory={loadingHistory}
            />
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-8">
          <div>
            AI-Powered Skin Analysis
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
