
import React from 'react';
import { Trophy } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StreakDisplayProps {
  streak: number;
}

const StreakDisplay = ({ streak }: StreakDisplayProps) => {
  return (
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
  );
};

export default StreakDisplay;
