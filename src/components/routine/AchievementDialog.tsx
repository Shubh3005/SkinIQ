
import React from 'react';
import { Trophy, Star, Award, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AchievementType {
  id: string;
  name: string;
  description: string;
  icon: string;
  user_id: string;
  created_at: string;
}

interface AchievementDialogProps {
  showAchievementDialog: boolean;
  setShowAchievementDialog: (show: boolean) => void;
  newAchievement: AchievementType | null;
}

const AchievementDialog = ({ 
  showAchievementDialog, 
  setShowAchievementDialog, 
  newAchievement 
}: AchievementDialogProps) => {
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
  );
};

export { renderAchievementIcon };
export default AchievementDialog;
