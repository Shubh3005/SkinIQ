
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trophy, Sun, Moon } from 'lucide-react';

interface RoutineLogType {
  id: string;
  user_id: string;
  date: string;
  morning_completed: boolean;
  evening_completed: boolean;
  created_at: string;
}

interface RoutineCalendarProps {
  showControls?: boolean;
}

const RoutineCalendar = ({ showControls = false }: RoutineCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [routineLogs, setRoutineLogs] = useState<RoutineLogType[]>([]);
  const [todayLog, setTodayLog] = useState<RoutineLogType | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const todayFormatted = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;
    fetchRoutineLogs();
  }, [user, selectedDate]);

  useEffect(() => {
    if (!user) return;
    findOrCreateTodayLog();
  }, [user, routineLogs]);

  const fetchRoutineLogs = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('routine_logs').select('*').eq('user_id', user.id).order('date', {
        ascending: false
      });
      if (error) throw error;
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

  const findOrCreateTodayLog = async () => {
    if (!user) return;
    
    const existingLog = routineLogs.find(log => log.date === todayFormatted);
    
    if (existingLog) {
      setTodayLog(existingLog);
      return;
    }
    
    if (showControls) {
      try {
        const { data, error } = await supabase
          .from('routine_logs')
          .insert({
            user_id: user.id,
            date: todayFormatted,
            morning_completed: false,
            evening_completed: false
          })
          .select()
          .single();
          
        if (error) throw error;
        setTodayLog(data);
        setRoutineLogs(prev => [data, ...prev]);
      } catch (error) {
        console.error('Error creating routine log:', error);
        toast({
          title: "Error",
          description: "Failed to create today's routine log",
          variant: "destructive"
        });
      }
    }
  };

  const updateRoutineLog = async (field: 'morning_completed' | 'evening_completed', value: boolean) => {
    if (!user || !todayLog) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('routine_logs')
        .update({ [field]: value })
        .eq('id', todayLog.id);
        
      if (error) throw error;
      
      setTodayLog(prev => prev ? { ...prev, [field]: value } : null);
      fetchRoutineLogs(); // Refresh data after update
      
      toast({
        title: "Success",
        description: `${field === 'morning_completed' ? 'Morning' : 'Evening'} routine ${value ? 'completed' : 'uncompleted'}!`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating routine log:', error);
      toast({
        title: "Error",
        description: "Failed to update routine status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getDateStatus = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const log = routineLogs.find(log => log.date === formattedDate);
    if (!log) return 'none';
    if (log.morning_completed && log.evening_completed) return 'both';
    if (log.morning_completed) return 'morning';
    if (log.evening_completed) return 'evening';
    return 'none';
  };

  // Calculate streaks based on routine logs
  const calculateStreaks = () => {
    if (!routineLogs.length) return { current: 0, longest: 0 };
    
    let current = 0;
    let longest = 0;
    let consecutive = 0;
    
    // Sort logs by date in descending order (newest first)
    const sortedLogs = [...routineLogs].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Check if today's log is complete
    const todayComplete = sortedLogs[0]?.date === todayFormatted && 
                          (sortedLogs[0].morning_completed || sortedLogs[0].evening_completed);
    
    // If today's log is not complete, don't count current streak
    if (!todayComplete) {
      current = 0;
    } else {
      // Calculate streaks
      for (let i = 0; i < sortedLogs.length; i++) {
        const log = sortedLogs[i];
        if (log.morning_completed || log.evening_completed) {
          consecutive++;
          if (consecutive > longest) longest = consecutive;
          if (i < sortedLogs.length - 1) {
            // Check if the next log is from the previous day
            const currentDate = new Date(log.date);
            const nextDate = new Date(sortedLogs[i + 1].date);
            const diffTime = Math.abs(currentDate.getTime() - nextDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays !== 1) {
              break; // Break the streak if days are not consecutive
            }
          }
        } else {
          break; // Break if a day has no routines completed
        }
      }
      current = consecutive;
    }
    
    return { current, longest };
  };

  const { current: currentStreak, longest: longestStreak } = calculateStreaks();

  return (
    <div className="w-full flex flex-col gap-6 bg-card rounded-xl shadow-md p-6">
      {showControls && (
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold mb-2">Your Skincare Routine</h2>
          <p className="text-muted-foreground">
            Track your daily morning and evening routines
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <Calendar 
          mode="single" 
          selected={selectedDate} 
          onSelect={setSelectedDate} 
          modifiers={{
            morning: date => getDateStatus(date) === 'morning',
            evening: date => getDateStatus(date) === 'evening',
            both: date => getDateStatus(date) === 'both'
          }}
          modifiersClassNames={{
            morning: "bg-amber-200 text-amber-800 font-medium hover:bg-amber-300",
            evening: "bg-blue-200 text-blue-800 font-medium hover:bg-blue-300",
            both: "bg-green-200 text-green-800 font-medium hover:bg-green-300"
          }}
          classNames={{
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 relative",
            day_selected: "bg-primary text-primary-foreground rounded-full",
            day_today: "bg-muted text-accent-foreground rounded-full border border-border"
          }}
          className="rounded-md border pointer-events-auto bg-card"
        />
      </div>
      
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-300 border border-green-500"></div>
          <span className="text-sm">Both Routines</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-300 border border-amber-500"></div>
          <span className="text-sm">Morning Only</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-300 border border-blue-500"></div>
          <span className="text-sm">Evening Only</span>
        </div>
      </div>

      {showControls && (
        <>
          <div className="border-t border-border pt-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-secondary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Sun className="mr-2 h-4 w-4 text-amber-500" />
                    Morning Routine
                  </h3>
                  <span className="text-xs bg-secondary px-2 py-1 rounded">
                    {todayFormatted}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="morning-routine" 
                    checked={todayLog?.morning_completed || false} 
                    onCheckedChange={(checked) => updateRoutineLog('morning_completed', checked === true)}
                    disabled={isUpdating}
                  />
                  <label
                    htmlFor="morning-routine"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I completed my morning routine
                  </label>
                </div>
              </div>
              
              <div className="bg-secondary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Moon className="mr-2 h-4 w-4 text-blue-500" />
                    Evening Routine
                  </h3>
                  <span className="text-xs bg-secondary px-2 py-1 rounded">
                    {todayFormatted}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="evening-routine" 
                    checked={todayLog?.evening_completed || false} 
                    onCheckedChange={(checked) => updateRoutineLog('evening_completed', checked === true)}
                    disabled={isUpdating}
                  />
                  <label
                    htmlFor="evening-routine"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I completed my evening routine
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-6 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <Trophy className="mr-2 h-4 w-4 text-amber-500" />
                Achievements
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-secondary/20 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current Streak</span>
                  <span className="text-2xl font-bold text-primary">{currentStreak}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Days in a row with at least one routine completed
                </p>
              </div>
              
              <div className="bg-secondary/20 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Longest Streak</span>
                  <span className="text-2xl font-bold text-primary">{longestStreak}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your best streak so far
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoutineCalendar;
