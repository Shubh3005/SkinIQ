
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, CalendarDays, Activity, Flame } from 'lucide-react';

interface ProgressSummaryProps {
  scanHistory: any[];
}

const SEVERITY_ORDER: Record<string, number> = {
  None: 0, Low: 1, Mild: 1, Moderate: 2, High: 3, Severe: 3,
};

function mostCommonCondition(scans: any[]): string {
  const counts: Record<string, number> = {};
  for (const s of scans) {
    const d = s.disease || 'Unknown';
    counts[d] = (counts[d] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
}

function scanStreak(scans: any[]): number {
  if (scans.length === 0) return 0;
  const uniqueDates = [...new Set(scans.map(s => {
    const d = new Date(s.created_at);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }))].sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const DAY = 86_400_000;

  let streak = 0;
  let cursor = today.getTime();
  for (const ts of uniqueDates) {
    const gap = cursor - ts;
    if (gap <= DAY) {
      streak++;
      cursor = ts;
    } else {
      break;
    }
  }
  return streak;
}

function severityChange(scans: any[]): { label: string; direction: 'improved' | 'worsened' | 'unchanged' } | null {
  if (scans.length < 2) return null;
  const newest = scans[0].acneSeverity;
  const oldest = scans[scans.length - 1].acneSeverity;
  if (!newest || !oldest) return null;

  const n = SEVERITY_ORDER[newest] ?? -1;
  const o = SEVERITY_ORDER[oldest] ?? -1;
  if (n === -1 || o === -1) return null;

  if (n < o) return { label: `Improved from ${oldest} to ${newest}`, direction: 'improved' };
  if (n > o) return { label: `Worsened from ${oldest} to ${newest}`, direction: 'worsened' };
  return { label: `Unchanged (${newest})`, direction: 'unchanged' };
}

export const ProgressSummary = ({ scanHistory }: ProgressSummaryProps) => {
  const empty = scanHistory.length === 0;
  const streak = scanStreak(scanHistory);
  const change = severityChange(scanHistory);
  const commonCondition = empty ? '—' : mostCommonCondition(scanHistory);
  const firstDate = empty ? null : new Date(scanHistory[scanHistory.length - 1].created_at);
  const lastDate = empty ? null : new Date(scanHistory[0].created_at);

  if (empty) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="mb-1 font-medium">No scan history yet</p>
        <p className="text-sm">Scan your skin to start tracking progress</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Scans"
          value={String(scanHistory.length)}
          icon={<Activity className="h-4 w-4" />}
          aria={`Total scans: ${scanHistory.length}`}
        />
        <MetricCard
          label="First Scan"
          value={firstDate ? format(firstDate, 'MMM d, yyyy') : '—'}
          icon={<CalendarDays className="h-4 w-4" />}
          aria={`First scan: ${firstDate ? format(firstDate, 'MMMM d, yyyy') : 'none'}`}
        />
        <MetricCard
          label="Latest Scan"
          value={lastDate ? format(lastDate, 'MMM d, yyyy') : '—'}
          icon={<CalendarDays className="h-4 w-4" />}
          aria={`Latest scan: ${lastDate ? format(lastDate, 'MMMM d, yyyy') : 'none'}`}
        />
        <MetricCard
          label="Scan Streak"
          value={`${streak} day${streak !== 1 ? 's' : ''}`}
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          aria={`Current scan streak: ${streak} days`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          label="Most Common Condition"
          value={commonCondition}
          aria={`Most common condition: ${commonCondition}`}
        />
        {change && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              {change.direction === 'improved' && <TrendingDown className="h-5 w-5 text-green-500 flex-shrink-0" />}
              {change.direction === 'worsened' && <TrendingUp className="h-5 w-5 text-red-500 flex-shrink-0" />}
              {change.direction === 'unchanged' && <Minus className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
              <div aria-label={`Clinical urgency: ${change.label}`}>
                <p className="text-xs text-muted-foreground">Clinical Urgency</p>
                <p className="text-sm font-medium">{change.label}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({
  label,
  value,
  icon,
  aria,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  aria: string;
}) => (
  <Card>
    <CardContent className="p-4" aria-label={aria}>
      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="font-semibold text-lg leading-tight">{value}</p>
    </CardContent>
  </Card>
);
