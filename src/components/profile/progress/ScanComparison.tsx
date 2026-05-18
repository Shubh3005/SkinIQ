
import { useState } from 'react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScanComparisonProps {
  scanHistory: any[];
}

const SEVERITY_ORDER: Record<string, number> = {
  None: 0, Low: 1, Mild: 1, Moderate: 2, High: 3, Severe: 3,
};

type DiffClass = 'improved' | 'worsened' | 'changed' | 'same';

function urgencyDiff(before: string, after: string): DiffClass {
  const b = SEVERITY_ORDER[before] ?? -1;
  const a = SEVERITY_ORDER[after] ?? -1;
  if (b === -1 || a === -1 || b === a) return 'same';
  return a < b ? 'improved' : 'worsened';
}

function textDiff(before: string, after: string): DiffClass {
  return before === after ? 'same' : 'changed';
}

function issuesDiff(before: any, after: any): DiffClass {
  const b = (Array.isArray(before) ? before : []).join(',');
  const a = (Array.isArray(after) ? after : []).join(',');
  return b === a ? 'same' : 'changed';
}

const DIFF_CLASSES: Record<DiffClass, string> = {
  improved: 'bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400',
  worsened: 'bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400',
  changed: 'bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400',
  same: 'bg-muted/40 border border-transparent',
};

const Field = ({
  label,
  value,
  diff,
}: {
  label: string;
  value: string;
  diff: DiffClass;
}) => (
  <div className={cn('rounded-md px-3 py-2', DIFF_CLASSES[diff])}>
    <p className="text-xs font-medium opacity-70 mb-0.5">{label}</p>
    <p className="text-sm font-medium">{value || '—'}</p>
  </div>
);

const ScanPanel = ({
  label,
  scan,
  compareTo,
}: {
  label: 'Before' | 'After';
  scan: any;
  compareTo: any | null;
}) => {
  const issues = Array.isArray(scan.skin_issues)
    ? scan.skin_issues.join(', ')
    : scan.skin_issues || '—';
  const compareIssues = compareTo
    ? Array.isArray(compareTo.skin_issues)
      ? compareTo.skin_issues.join(', ')
      : compareTo.skin_issues || '—'
    : null;

  const urgencyField = compareTo
    ? urgencyDiff(
        label === 'Before' ? scan.acneSeverity : compareTo.acneSeverity,
        label === 'Before' ? compareTo.acneSeverity : scan.acneSeverity,
      )
    : 'same';

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label} — {format(new Date(scan.created_at), 'MMM d, yyyy')}
      </div>
      {scan.scan_image ? (
        <img
          src={scan.scan_image}
          loading="lazy"
          alt={`${label} scan from ${format(new Date(scan.created_at), 'MMM d, yyyy')}`}
          className="w-full rounded-lg object-cover max-h-52"
        />
      ) : (
        <div className="w-full h-40 rounded-lg bg-muted flex items-center justify-center">
          <ImageOff className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div className="space-y-2">
        <Field
          label="Skin Type"
          value={scan.skin_type || '—'}
          diff={compareTo ? textDiff(scan.skin_type, compareTo.skin_type) : 'same'}
        />
        <Field
          label="Skin Tone"
          value={scan.skin_tone || '—'}
          diff={compareTo ? textDiff(scan.skin_tone, compareTo.skin_tone) : 'same'}
        />
        <Field
          label="Skin Issues"
          value={issues}
          diff={compareTo ? issuesDiff(scan.skin_issues, compareTo.skin_issues) : 'same'}
        />
        <Field
          label="Detected Condition"
          value={scan.disease || '—'}
          diff={compareTo ? textDiff(scan.disease, compareTo.disease) : 'same'}
        />
        <Field
          label="Clinical Urgency"
          value={scan.acneSeverity || '—'}
          diff={urgencyField}
        />
      </div>
    </div>
  );
};

export const ScanComparison = ({ scanHistory }: ScanComparisonProps) => {
  const [beforeId, setBeforeId] = useState<string>('');
  const [afterId, setAfterId] = useState<string>('');

  if (scanHistory.length < 2) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        You need at least 2 scans to compare. Complete another scan to unlock.
      </div>
    );
  }

  const beforeScan = scanHistory.find(s => s.id === beforeId) ?? null;
  const afterScan = scanHistory.find(s => s.id === afterId) ?? null;
  const sameSelected = beforeId && afterId && beforeId === afterId;

  const scanOption = (s: any) =>
    `${format(new Date(s.created_at), 'MMM d, yyyy')} — ${s.disease || 'Unknown'}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Before</label>
          <Select value={beforeId} onValueChange={setBeforeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select scan…" />
            </SelectTrigger>
            <SelectContent>
              {scanHistory.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {scanOption(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">After</label>
          <Select value={afterId} onValueChange={setAfterId}>
            <SelectTrigger>
              <SelectValue placeholder="Select scan…" />
            </SelectTrigger>
            <SelectContent>
              {scanHistory.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {scanOption(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {sameSelected && (
        <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
          Select two different scans to compare.
        </p>
      )}

      {beforeScan && afterScan && !sameSelected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <ScanPanel label="Before" scan={beforeScan} compareTo={afterScan} />
          <ScanPanel label="After" scan={afterScan} compareTo={beforeScan} />
        </div>
      )}

      {(beforeScan || afterScan) && !sameSelected && (
        <div className="flex flex-wrap gap-3 pt-2 text-xs text-muted-foreground border-t pt-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/40" />
            Improved
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/40" />
            Worsened
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/40" />
            Changed
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-muted" />
            Unchanged
          </span>
        </div>
      )}
    </div>
  );
};
