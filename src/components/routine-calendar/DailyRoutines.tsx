
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Sun, Moon, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DailyRoutinesProps {
  selectedDate: Date | undefined;
  isMorningCompleted: boolean;
  isEveningCompleted: boolean;
  markRoutine: (type: 'morning' | 'evening') => void;
  isUserLoggedIn: boolean;
  skinType?: string | null;
}

const MORNING_STEPS: Record<string, string[]> = {
  Oily: [
    'Cleanser — wash face with a gentle foaming cleanser',
    'Toner — apply an alcohol-free toner to minimize pores',
    'Moisturizer — apply a lightweight oil-free moisturizer',
    'Sunscreen SPF 30+ — apply as the final step',
  ],
  Dry: [
    'Cleanser — wash face with a gentle creamy cleanser',
    'Serum — apply a hydrating hyaluronic acid serum',
    'Moisturizer — apply a rich nourishing moisturizer',
    'Sunscreen SPF 30+ — apply as the final step',
  ],
  Combination: [
    'Cleanser — wash face with a gentle balanced cleanser',
    'Toner — apply a balancing toner to the T-zone',
    'Moisturizer — apply a lightweight moisturizer',
    'Sunscreen SPF 30+ — apply as the final step',
  ],
  Sensitive: [
    'Cleanser — wash face with a fragrance-free gentle cleanser',
    'Serum — apply a calming niacinamide serum',
    'Moisturizer — apply a soothing barrier-repair moisturizer',
    'Sunscreen SPF 50+ — apply mineral sunscreen as the final step',
  ],
  Normal: [
    'Cleanser — wash face with a gentle daily cleanser',
    'Moisturizer — apply a daily moisturizer',
    'Sunscreen SPF 30+ — apply as the final step',
  ],
};

const EVENING_STEPS: Record<string, string[]> = {
  Oily: [
    'Cleanser — double-cleanse with an oil cleanser then a foaming cleanser',
    'Exfoliant — apply a BHA (salicylic acid) 2–3 times per week',
    'Moisturizer — apply a light gel moisturizer',
  ],
  Dry: [
    'Cleanser — wash with a gentle non-stripping cleanser',
    'Serum — apply a retinol or peptide serum',
    'Moisturizer — apply a thick nourishing night cream',
    'Face Oil — seal in moisture with a facial oil',
  ],
  Combination: [
    'Cleanser — wash with a gentle balanced cleanser',
    'Treatment — apply a lightweight serum to dry areas',
    'Moisturizer — apply a medium-weight moisturizer',
  ],
  Sensitive: [
    'Cleanser — wash with a fragrance-free gentle cleanser',
    'Serum — apply a ceramide-rich barrier serum',
    'Moisturizer — apply a calming overnight moisturizer',
  ],
  Normal: [
    'Cleanser — wash with a gentle daily cleanser',
    'Serum — apply an antioxidant or vitamin C serum',
    'Moisturizer — apply a night moisturizer',
  ],
};

export const DailyRoutines = ({
  selectedDate,
  isMorningCompleted,
  isEveningCompleted,
  markRoutine,
  isUserLoggedIn,
  skinType,
}: DailyRoutinesProps) => {
  const navigate = useNavigate();
  const normalizedType = skinType
    ? Object.keys(MORNING_STEPS).find(k => k.toLowerCase() === skinType.toLowerCase()) ?? null
    : null;

  const morningSteps = normalizedType ? MORNING_STEPS[normalizedType] : null;
  const eveningSteps = normalizedType ? EVENING_STEPS[normalizedType] : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-muted/40 backdrop-blur-sm rounded-lg p-4 border border-border">
        <h3 className="font-semibold mb-3">
          {format(selectedDate || new Date(), 'MMMM d, yyyy')}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 p-2 rounded-full">
                <Star className="h-4 w-4 text-amber-600" />
              </div>
              <span>Morning Routine</span>
            </div>
            <Button
              variant={isMorningCompleted ? 'default' : 'outline'}
              size="sm"
              onClick={() => markRoutine('morning')}
              disabled={!isUserLoggedIn}
              className={isMorningCompleted ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              {isMorningCompleted ? 'Completed' : 'Mark Complete'}
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
              variant={isEveningCompleted ? 'default' : 'outline'}
              size="sm"
              onClick={() => markRoutine('evening')}
              disabled={!isUserLoggedIn}
              className={isEveningCompleted ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              {isEveningCompleted ? 'Completed' : 'Mark Complete'}
            </Button>
          </div>
        </div>
      </div>

      {!normalizedType ? (
        <div className="bg-muted/40 rounded-lg p-4 border border-border text-center text-sm text-muted-foreground">
          <p className="mb-2">Set your skin type to see your personalized routine.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
            Complete Profile
          </Button>
        </div>
      ) : (
        <>
          <RoutineSteps
            icon={<Sun className="h-4 w-4 text-amber-500" />}
            title="Morning Steps"
            steps={morningSteps!}
          />
          <RoutineSteps
            icon={<Moon className="h-4 w-4 text-blue-500" />}
            title="Evening Steps"
            steps={eveningSteps!}
          />
        </>
      )}
    </div>
  );
};

const RoutineSteps = ({
  icon,
  title,
  steps,
}: {
  icon: React.ReactNode;
  title: string;
  steps: string[];
}) => (
  <div className="bg-muted/40 rounded-lg p-4 border border-border">
    <h4 className="font-medium flex items-center gap-2 mb-3">
      {icon}
      {title}
    </h4>
    <ol className="space-y-2 list-none">
      {steps.map((step, i) => (
        <li key={i} className="text-sm flex gap-2">
          <span className="text-muted-foreground font-mono min-w-[1.25rem]">{i + 1}.</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  </div>
);
