
import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Palette, ShieldCheck, AlertTriangle, BarChart } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AnalysisResults = {
  skinType?: string;
  skinTone?: string;
  skinIssues?: string;
  disease?: string;
  acneSeverity?: string;
};

interface ScanResultsProps {
  analysisResults: AnalysisResults | null;
}

export const ScanResults = ({ analysisResults }: ScanResultsProps) => {
  return (
    <Card className="border-2 border-primary/20 shadow-lg shadow-primary/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Skin Analysis</h2>
          </div>
          <Badge variant="outline" className="text-xs">
            {analysisResults ? "COMPLETE" : "READY"}
          </Badge>
        </div>

        <div className="space-y-4">
          {analysisResults ? (
            <>
              <ResultCard 
                icon={<Droplet className="h-5 w-5 text-blue-400" />}
                title="Skin Type"
                value={analysisResults.skinType}
              />
              <ResultCard 
                icon={<Palette className="h-5 w-5 text-green-400" />}
                title="Skin Tone"
                value={analysisResults.skinTone}
              />
              <ResultCard 
                icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                title="Skin Issues"
                value={analysisResults.skinIssues}
              />
              <ResultCard 
                icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
                title="Possible Disease"
                value={analysisResults.disease || "No disease detected"}
              />
              <ResultCard 
                icon={<BarChart className="h-5 w-5 text-purple-400" />}
                title="Acne Severity"
                value={analysisResults.acneSeverity || "None"}
              />
            </>
          ) : (
            // Show empty state cards when no results
            Array.from({ length: 5 }).map((_, index) => (
              <EmptyResultCard
                key={index}
                icon={[
                  <Droplet />,
                  <Palette />,
                  <ShieldCheck />,
                  <AlertTriangle />,
                  <BarChart />
                ][index]}
                title={[
                  "Skin Type",
                  "Skin Tone",
                  "Skin Issues",
                  "Possible Disease",
                  "Acne Severity"
                ][index]}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper components
const ResultCard = ({ icon, title, value, delay = 0 }: { 
  icon: React.ReactNode;
  title: string;
  value?: string;
  delay?: number;
}) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="bg-card/60 rounded-lg p-4 flex items-start gap-3 border-2 border-primary/10 shadow-md"
  >
    <div className="mt-1">{icon}</div>
    <div>
      <h3 className="text-sm text-muted-foreground font-medium mb-1">{title}</h3>
      <p className="font-mono text-md font-medium">{value}</p>
    </div>
  </motion.div>
);

const EmptyResultCard = ({ icon, title, delay = 0 }: { 
  icon: React.ReactNode;
  title: string;
  delay?: number;
}) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="bg-card/60 rounded-lg p-4 flex items-start gap-3 border border-dashed border-muted"
  >
    <div className="mt-1">{icon}</div>
    <div>
      <h3 className="text-sm text-muted-foreground font-medium mb-1">{title}</h3>
      <div className="w-32 h-5 bg-muted/50 rounded animate-pulse"></div>
    </div>
  </motion.div>
);

// Fix missing Scan import
import { Scan } from 'lucide-react';
