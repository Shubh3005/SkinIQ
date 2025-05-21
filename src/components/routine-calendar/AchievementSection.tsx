
import { Badge } from "@/components/ui/badge";
import { Trophy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, Star, Award } from 'lucide-react';
import { AchievementType } from "./types";

interface AchievementSectionProps {
  achievements: AchievementType[];
}

export const AchievementSection = ({ achievements }: AchievementSectionProps) => {
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

  return (
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
          {achievements.slice(0, 4).map(achievement => (
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
  );
};
