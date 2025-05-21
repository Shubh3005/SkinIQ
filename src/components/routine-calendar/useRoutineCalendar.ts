
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { RoutineLogType, AchievementType, DateStatus } from './types';

export const useRoutineCalendar = (userId?: string) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [routineLogs, setRoutineLogs] = useState<RoutineLogType[]>([]);
  const [achievements, setAchievements] = useState<AchievementType[]>([]);
  const [streak, setStreak] = useState(0);
  const [isMorningCompleted, setIsMorningCompleted] = useState(false);
  const [isEveningCompleted, setIsEveningCompleted] = useState(false);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [newAchievement, setNewAchievement] = useState<AchievementType | null>(null);
  const { toast } = useToast();
  
  // Get today's date with time set to beginning of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (!userId) return;
    fetchRoutineLogs();
    fetchAchievements();
  }, [userId, selectedDate]);

  useEffect(() => {
    if (routineLogs.length > 0) {
      calculateStreak();
    }
  }, [routineLogs]);

  useEffect(() => {
    if (!selectedDate || !routineLogs.length) return;
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const todayLog = routineLogs.find(log => log.date === formattedDate);
    setIsMorningCompleted(todayLog?.morning_completed || false);
    setIsEveningCompleted(todayLog?.evening_completed || false);
  }, [selectedDate, routineLogs]);

  const fetchRoutineLogs = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('routine_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      console.log("Fetched routine logs:", data);
      setRoutineLogs(data || []);
    } catch (error) {
      console.error('Error fetching routine logs:', error);
      toast({
        title: "Error",
        description: "Failed to load routine data",
        variant: "destructive"
      });
    }
  };

  const fetchAchievements = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const calculateStreak = async () => {
    const sortedLogs = [...routineLogs].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayFormatted = format(today, 'yyyy-MM-dd');
    const todayLog = sortedLogs.find(log => log.date === todayFormatted);
    
    if (todayLog && (todayLog.morning_completed || todayLog.evening_completed)) {
      currentStreak++;
    }
    
    let checkDate = yesterday;
    let dayCounter = 1;
    
    while (dayCounter < 30) {
      const dateFormatted = format(checkDate, 'yyyy-MM-dd');
      const log = sortedLogs.find(log => log.date === dateFormatted);
      
      if (log && log.morning_completed && log.evening_completed) {
        currentStreak++;
      } else {
        break;
      }
      
      checkDate.setDate(checkDate.getDate() - 1);
      dayCounter++;
    }
    
    setStreak(currentStreak);
    checkStreakAchievements(currentStreak);
  };

  const checkStreakAchievements = async (currentStreak: number) => {
    if (!userId) return;
    
    const streakMilestones = [
      { days: 3, name: "Getting Started", description: "Completed routines for 3 days in a row", icon: "check" },
      { days: 7, name: "One Week Wonder", description: "Completed routines for a full week", icon: "star" },
      { days: 14, name: "Consistency Champion", description: "Two weeks of dedicated skincare", icon: "award" },
      { days: 30, name: "Skincare Master", description: "A full month of perfect routines", icon: "trophy" }
    ];
    
    for (const milestone of streakMilestones) {
      if (currentStreak >= milestone.days) {
        const hasAchievement = achievements.some(a => a.name === milestone.name);
        
        if (!hasAchievement) {
          try {
            const { data, error } = await supabase
              .from('achievements')
              .insert({
                user_id: userId,
                name: milestone.name,
                description: milestone.description,
                icon: milestone.icon
              })
              .select()
              .single();
              
            if (error) throw error;
            
            if (data) {
              setNewAchievement(data);
              setShowAchievementDialog(true);
              setAchievements(prev => [...prev, data]);
            }
          } catch (error) {
            console.error('Error creating achievement:', error);
          }
        }
      }
    }
  };

  const markRoutine = async (type: 'morning' | 'evening') => {
    if (!userId || !selectedDate) return;
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    try {
      const { data: existingLog } = await supabase
        .from('routine_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', formattedDate)
        .single();
      
      if (existingLog) {
        // Update existing log
        await supabase
          .from('routine_logs')
          .update({ 
            [type === 'morning' ? 'morning_completed' : 'evening_completed']: 
              !existingLog[type === 'morning' ? 'morning_completed' : 'evening_completed'] 
          })
          .eq('id', existingLog.id);
          
        type === 'morning' 
          ? setIsMorningCompleted(!existingLog.morning_completed)
          : setIsEveningCompleted(!existingLog.evening_completed);
      } else {
        // Create new log
        const newLog = {
          user_id: userId,
          date: formattedDate,
          morning_completed: type === 'morning',
          evening_completed: type === 'evening'
        };
        
        await supabase
          .from('routine_logs')
          .insert(newLog);
          
        type === 'morning' ? setIsMorningCompleted(true) : setIsEveningCompleted(true);
      }
      
      fetchRoutineLogs();
      
      toast({
        title: "Routine updated",
        description: `Your ${type} routine has been marked as completed!`
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

  const getDateStatus = (date: Date): DateStatus => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const log = routineLogs.find(log => log.date === formattedDate);
    
    if (!log) return 'none';
    if (log.morning_completed && log.evening_completed) return 'both';
    if (log.morning_completed) return 'morning';
    if (log.evening_completed) return 'evening';
    return 'none';
  };

  return {
    selectedDate,
    setSelectedDate,
    routineLogs,
    achievements,
    streak,
    isMorningCompleted,
    isEveningCompleted,
    showAchievementDialog,
    setShowAchievementDialog,
    newAchievement,
    today,
    markRoutine,
    getDateStatus,
  };
};
