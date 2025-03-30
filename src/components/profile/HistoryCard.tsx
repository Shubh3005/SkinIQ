
import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarDays, ClipboardList } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HistoryCardProps {
  scanHistory: any[];
  chatHistory: any[];
  loadingHistory: boolean;
}

export const HistoryCard = ({ scanHistory, chatHistory, loadingHistory }: HistoryCardProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const hasEventsForDate = (date: Date) => {
    if (!scanHistory) return false;
    return scanHistory.some(scan => {
      const scanDate = new Date(scan.created_at);
      return scanDate.toDateString() === date.toDateString();
    });
  };

  const getScansForDate = (date: Date) => {
    return scanHistory.filter(scan => {
      const scanDate = new Date(scan.created_at);
      return scanDate.toDateString() === date.toDateString();
    });
  };

  const formatDate = (date: Date | undefined) => {
    return date ? format(date, 'PPP') : 'No date selected';
  };

  return (
    <Card className="w-full h-full border-2 border-primary/20 shadow-lg shadow-primary/10">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Skin History
            </CardTitle>
            <CardDescription>
              View your scan and chat history
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {formatDate(selectedDate)}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Select a date to view your skin history
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            classNames={{
              day: cn(
                "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                {
                  "bg-primary/20 text-primary-foreground font-bold": hasEventsForDate
                }
              )
            }}
          />
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading history...
          </div>
        ) : (
          <>
            {selectedDate && getScansForDate(selectedDate).length > 0 ? (
              <>
                <h3 className="text-xl font-semibold mb-2">Scans for {formatDate(selectedDate)}</h3>
                <div className="space-y-4">
                  {getScansForDate(selectedDate).map((scan, index) => (
                    <div key={scan.id} className="bg-muted/70 backdrop-blur-sm p-4 rounded-lg border border-primary/10 shadow-md">
                      <h4 className="font-medium">Scan #{index + 1}</h4>
                      <p className="text-sm text-muted-foreground">Skin Type: {scan.skin_type}</p>
                      <p className="text-sm text-muted-foreground">Skin Issues: {scan.skin_issues}</p>
                      <p className="text-sm text-muted-foreground">Sun Damage: {scan.sun_damage}</p>
                      <p className="text-sm text-muted-foreground">Unique Feature: {scan.unique_feature}</p>
                      <p className="text-sm text-muted-foreground">Skin Tone: {scan.skin_tone}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                No scans found for this date.
              </div>
            )}

            <div className="my-4 border-t" />

            <h3 className="text-xl font-semibold mb-2">Recent Chats</h3>
            {chatHistory.length > 0 ? (
              <div className="space-y-4">
                {chatHistory.slice(0, 3).map((chat, index) => (
                  <div key={chat.id} className="bg-muted/70 backdrop-blur-sm p-4 rounded-lg border border-primary/10 shadow-md">
                    <h4 className="font-medium">Chat #{index + 1}</h4>
                    <p className="text-sm text-muted-foreground">Message: {chat.message}</p>
                    <p className="text-sm text-muted-foreground">Response: {chat.response}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No chat history found.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
