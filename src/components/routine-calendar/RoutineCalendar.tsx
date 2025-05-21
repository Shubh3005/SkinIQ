
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from '@/contexts/AuthContext';
import { Trophy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DailyRoutines } from './DailyRoutines';
import { RoutineCalendarLegend } from './RoutineCalendarLegend';
import { useRoutineCalendar } from './useRoutineCalendar';

const RoutineCalendar = () => {
  const { user } = useAuth();
  const {
    selectedDate,
    setSelectedDate,
    achievements,
    streak,
    isMorningCompleted,
    isEveningCompleted,
    showAchievementDialog,
    setShowAchievementDialog,
    newAchievement,
    today,
    markRoutine,
    getDateStatus
  } = useRoutineCalendar(user?.id);

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
            disabled={(date) => {
              const dateWithoutTime = new Date(date);
              dateWithoutTime.setHours(0, 0, 0, 0);
              const todayWithoutTime = new Date(today);
              todayWithoutTime.setHours(0, 0, 0, 0);
              return dateWithoutTime.getTime() !== todayWithoutTime.getTime();
            }}
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
            className="rounded-md border pointer-events-auto"
          />
          <RoutineCalendarLegend />
        </div>

        <div className="flex flex-col gap-4">
          <DailyRoutines 
            selectedDate={selectedDate}
            isMorningCompleted={isMorningCompleted}
            isEveningCompleted={isEveningCompleted}
            markRoutine={markRoutine}
            isUserLoggedIn={!!user}
          />

        </div>
      </div>

  
    </div>
  );
};

export default RoutineCalendar;
