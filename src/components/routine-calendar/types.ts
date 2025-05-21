
export interface RoutineLogType {
  id: string;
  user_id: string;
  date: string;
  morning_completed: boolean;
  evening_completed: boolean;
  created_at: string;
}

export interface AchievementType {
  id: string;
  name: string;
  description: string;
  icon: string;
  user_id: string;
  created_at: string;
}

export type DateStatus = 'none' | 'morning' | 'evening' | 'both';
