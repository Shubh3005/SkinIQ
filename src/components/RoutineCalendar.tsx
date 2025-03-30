
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

interface RoutineLogType {
  id: string;
  user_id: string;
  date: string;
  morning_completed: boolean;
  evening_completed: boolean;
  created_at: string;
}

const RoutineCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [routineLogs, setRoutineLogs] = useState<RoutineLogType[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    fetchRoutineLogs();
  }, [user, selectedDate]);

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

  const getDateStatus = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const log = routineLogs.find(log => log.date === formattedDate);
    if (!log) return 'none';
    if (log.morning_completed && log.evening_completed) return 'both';
    if (log.morning_completed) return 'morning';
    if (log.evening_completed) return 'evening';
    return 'none';
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-card rounded-xl shadow-md p-6">
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
    </div>
  );
};

export default RoutineCalendar;
