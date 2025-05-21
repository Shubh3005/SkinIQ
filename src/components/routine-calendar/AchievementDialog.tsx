
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Award, Trophy } from 'lucide-react';
import { AchievementType } from "./types";

interface AchievementDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  achievement: AchievementType | null;
}

export const AchievementDialog = ({ showDialog, setShowDialog, achievement }: AchievementDialogProps) => {
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
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">🎉 Achievement Unlocked! 🎉</DialogTitle>
          <DialogDescription className="text-center">
            You've earned a new achievement badge!
          </DialogDescription>
        </DialogHeader>
        {achievement && (
          <div className="flex flex-col items-center py-6">
            <div className="mb-4 bg-primary/10 p-6 rounded-full">
              {renderAchievementIcon(achievement.icon)}
            </div>
            <h3 className="text-xl font-bold mb-2">{achievement.name}</h3>
            <p className="text-center text-muted-foreground">{achievement.description}</p>
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => setShowDialog(false)} className="w-full">
            Awesome!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
