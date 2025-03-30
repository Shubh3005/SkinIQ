
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

// Example data structure
interface RoutineStatsEntry {
  date: string;
  morning: number;
  evening: number;
  both: number;
}

interface StatsBarGraphProps {
  data: RoutineStatsEntry[];
  title?: string;
  description?: string;
}

const StatsBarGraph: React.FC<StatsBarGraphProps> = ({ 
  data, 
  title = "Routine Completion Stats", 
  description = "Statistics of completed skincare routines by type" 
}) => {
  const chartConfig = {
    morning: {
      label: "Morning",
      color: "#93c5fd" // blue-300
    },
    evening: {
      label: "Evening",
      color: "#8b5cf6" // purple-500
    },
    both: {
      label: "Both",
      color: "#22c55e" // green-500
    }
  };

  return (
    <Card className="w-full mt-8 mb-8">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="morning" fill={chartConfig.morning.color} name="Morning" />
                <Bar dataKey="evening" fill={chartConfig.evening.color} name="Evening" />
                <Bar dataKey="both" fill={chartConfig.both.color} name="Both" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsBarGraph;
