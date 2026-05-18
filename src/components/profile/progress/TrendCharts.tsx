
import { format } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';

interface TrendChartsProps {
  scanHistory: any[];
}

const SEVERITY_NUM: Record<string, number> = {
  None: 0, Low: 1, Mild: 1, Moderate: 2, High: 3, Severe: 3,
};
const NUM_LABEL: Record<number, string> = { 0: 'None', 1: 'Low', 2: 'Moderate', 3: 'High' };
const BAR_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#4f46e5', '#818cf8'];

function buildTrendData(scans: any[]) {
  return [...scans].reverse().map(s => ({
    date: format(new Date(s.created_at), 'MMM d'),
    severity: SEVERITY_NUM[s.acneSeverity] ?? 0,
    severityLabel: s.acneSeverity || 'None',
    disease: s.disease || 'Unknown',
  }));
}

function buildFrequencyData(scans: any[]) {
  const counts: Record<string, number> = {};
  for (const s of scans) {
    const issues: string[] = Array.isArray(s.skin_issues) ? s.skin_issues : [];
    for (const issue of issues) {
      counts[issue] = (counts[issue] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

const SeverityTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium">{d.date}</p>
      <p className="text-muted-foreground">Severity: {d.severityLabel}</p>
      <p className="text-muted-foreground">Condition: {d.disease}</p>
    </div>
  );
};

export const TrendCharts = ({ scanHistory }: TrendChartsProps) => {
  if (scanHistory.length < 3) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        Track 3 or more scans to see your skin trends.
      </div>
    );
  }

  const trendData = buildTrendData(scanHistory);
  const freqData = buildFrequencyData(scanHistory);
  const dateRange = `${trendData[0].date} to ${trendData[trendData.length - 1].date}`;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold mb-3">Clinical Urgency Over Time</h3>
        <div
          role="img"
          aria-label={`Line chart of clinical urgency over ${scanHistory.length} scans from ${dateRange}`}
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis
                domain={[0, 3]}
                ticks={[0, 1, 2, 3]}
                tickFormatter={(v) => NUM_LABEL[v] ?? ''}
                tick={{ fontSize: 11 }}
                width={60}
              />
              <ReTooltip content={<SeverityTooltip />} />
              <Line
                type="monotone"
                dataKey="severity"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4, fill: '#6366f1' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {freqData.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Skin Concern Frequency</h3>
          <div
            role="img"
            aria-label={`Bar chart showing frequency of ${freqData.length} skin concerns across ${scanHistory.length} scans`}
          >
            <ResponsiveContainer width="100%" height={Math.max(180, freqData.length * 32)}>
              <BarChart
                data={freqData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                <ReTooltip
                  formatter={(value: number) => [`${value} scan${value !== 1 ? 's' : ''}`, 'Frequency']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {freqData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
