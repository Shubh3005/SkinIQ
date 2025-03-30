import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoutineLogType {
  id: string;
  user_id: string;
  date: string;
  morning_completed: boolean;
  evening_completed: boolean;
  created_at: string;
}

interface AchievementType {
  id: string;
  name: string;
  description: string;
  icon: string;
  user_id: string;
  created_at: string;
}

const RoutineCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [routineLogs, setRoutineLogs] = useState<RoutineLogType[]>([]);
  const [achievements, setAchievements] = useState<AchievementType[]>([]);
  const [streak, setStreak] = useState(0);
  const [isMorningCompleted, setIsMorningCompleted] = useState(false);
  const [isEveningCompleted, setIsEveningCompleted] = useState(false);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [newAchievement, setNewAchievement] = useState<AchievementType | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    
    fetchRoutineLogs();
    fetchAchievements();
  }, [user, selectedDate]);

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
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('routine_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      setRoutineLogs(data || []);
    } catch (error) {
      console.error('Error fetching routine logs:', error);
      toast({
        title: "Error",
        description: "Failed to load routine data",
        variant: "destructive",
      });
    }
  };

  const fetchAchievements = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
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
      
      if (log && (log.morning_completed && log.evening_completed)) {
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
    if (!user) return;
    
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
                user_id: user.id,
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
    if (!user || !selectedDate) return;
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    try {
      const { data: existingLog } = await supabase
        .from('routine_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', formattedDate)
        .single();
      
      if (existingLog) {
        await supabase
          .from('routine_logs')
          .update({
            [type === 'morning' ? 'morning_completed' : 'evening_completed']: !existingLog[type === 'morning' ? 'morning_completed' : 'evening_completed']
          })
          .eq('id', existingLog.id);
        
        type === 'morning' ? 
          setIsMorningCompleted(!existingLog.morning_completed) : 
          setIsEveningCompleted(!existingLog.evening_completed);
      } else {
        const newLog = {
          user_id: user.id,
          date: formattedDate,
          morning_completed: type === 'morning',
          evening_completed: type === 'evening'
        };
        
        await supabase.from('routine_logs').insert(newLog);
        
        type === 'morning' ? setIsMorningCompleted(true) : setIsEveningCompleted(true);
      }
      
      fetchRoutineLogs();
      
      toast({
        title: "Routine updated",
        description: `Your ${type} routine has been marked as completed!`,
      });
    } catch (error) {
      console.error('Error updating routine:', error);
      toast({
        title: "Error",
        description: "Failed to update routine",
        variant: "destructive",
      });
    }
  };

  const renderAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'check':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'star':
        return <Star className="h-6 w-6 text-yellow-500" />;
      case 'award':
        return <Award className="h-6 w-6 text-blue-500" />;
      case 'trophy':
        return <Trophy className="h-6 w-6 text-purple-500" />;
      default:
        return <Award className="h-6 w-6 text-primary" />;
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

  const getDayClass = (date: Date): string => {
    const status = getDateStatus(date);
    if (status === 'morning') return "bg-amber-200 text-amber-800 font-medium hover:bg-amber-300";
    if (status === 'evening') return "bg-blue-200 text-blue-800 font-medium hover:bg-blue-300";
    if (status === 'both') return "bg-green-200 text-green-800 font-medium hover:bg-green-300";
    return "";
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-card rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">Your Skincare Routine</h2>
          <p className="text-muted-foreground">Track your daily morning and evening routines</p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{streak} Day Streak</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Keep your streak going by completing both routines daily!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border pointer-events-auto bg-card"
            modifiers={{
              morning: (date) => getDateStatus(date) === 'morning',
              evening: (date) => getDateStatus(date) === 'evening',
              both: (date) => getDateStatus(date) === 'both'
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
          />
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

        <div className="flex flex-col gap-4">
          <div className="bg-muted/40 backdrop-blur-sm rounded-lg p-4 border border-border">
            <h3 className="font-semibold mb-3">{format(selectedDate || new Date(), 'MMMM d, yyyy')}</h3>
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
                  onClick={() => markRoutine('morning')}
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
                  onClick={() => markRoutine('evening')}
                  disabled={!user}
                  className={isEveningCompleted ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  {isEveningCompleted ? "Completed" : "Mark Complete"}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-muted/40 backdrop-blur-sm rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Your Achievements</h3>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {achievements.length}
              </Badge>
            </div>
            {achievements.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {achievements.slice(0, 4).map((achievement) => (
                  <TooltipProvider key={achievement.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-card p-2 rounded-md flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-default">
                          {renderAchievementIcon(achievement.icon)}
                          <span className="text-xs mt-1 font-medium">{achievement.name}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{achievement.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-2">
                <p className="text-sm">Complete routines to earn achievements</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">🎉 Achievement Unlocked! 🎉</DialogTitle>
            <DialogDescription className="text-center">
              You've earned a new achievement badge!
            </DialogDescription>
          </DialogHeader>
          {newAchievement && (
            <div className="flex flex-col items-center py-6">
              <div className="mb-4 bg-primary/10 p-6 rounded-full">
                {renderAchievementIcon(newAchievement.icon)}
              </div>
              <h3 className="text-xl font-bold mb-2">{newAchievement.name}</h3>
              <p className="text-center text-muted-foreground">{newAchievement.description}</p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowAchievementDialog(false)} className="w-full">
              Awesome!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoutineCalendar;
