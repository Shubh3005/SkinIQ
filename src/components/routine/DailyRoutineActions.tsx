
import React from 'react';
import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface DailyRoutineActionsProps {
  selectedDate: Date | undefined;
  isMorningCompleted: boolean;
  isEveningCompleted: boolean;
  markRoutine: (type: 'morning' | 'evening') => void;
}

const DailyRoutineActions = ({
  selectedDate,
  isMorningCompleted,
  isEveningCompleted,
  markRoutine
}: DailyRoutineActionsProps) => {
  return (
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
            className={isEveningCompleted ? "bg-blue-500 hover:bg-blue-600" : ""}
          >
            {isEveningCompleted ? "Completed" : "Mark Complete"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DailyRoutineActions;
