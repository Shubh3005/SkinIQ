
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2 } from 'lucide-react';
import { ProgressSummary } from './progress/ProgressSummary';
import { TrendCharts } from './progress/TrendCharts';
import { ScanComparison } from './progress/ScanComparison';

interface ProgressVisualizationProps {
  scanHistory: any[];
}

export const ProgressVisualization = ({ scanHistory }: ProgressVisualizationProps) => {
  return (
    <Card className="w-full border-2 border-primary/20 shadow-lg shadow-primary/10">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          Skin Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="summary">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
            <TabsTrigger value="trends" className="flex-1">Trends</TabsTrigger>
            <TabsTrigger value="compare" className="flex-1">Compare</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <ProgressSummary scanHistory={scanHistory} />
          </TabsContent>
          <TabsContent value="trends">
            <TrendCharts scanHistory={scanHistory} />
          </TabsContent>
          <TabsContent value="compare">
            <ScanComparison scanHistory={scanHistory} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
