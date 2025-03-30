
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface RoutineTypeData {
  name: string;
  count: number;
  color: string;
}

interface RoutineTypeGraphProps {
  data: RoutineTypeData[];
  title?: string;
  description?: string;
}

const RoutineTypeGraph: React.FC<RoutineTypeGraphProps> = ({ 
  data, 
  title = "Routine Completion Summary", 
  description = "Number of days completed by routine type" 
}) => {
  const chartConfig = {
    morning: {
      label: "Morning Only",
      color: "#f59e0b" // amber-500 to match calendar morning color
    },
    evening: {
      label: "Evening Only",
      color: "#3b82f6" // blue-500 to match calendar evening color
    },
    both: {
      label: "Both Routines",
      color: "#22c55e" // green-500 to match calendar both routines color
    }
  };

  return (
    <Card className="h-full border shadow">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={100}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="count" 
                  fill={(entry) => entry.color || '#8884d8'} 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoutineTypeGraph;
