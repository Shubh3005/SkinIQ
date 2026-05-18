
import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CalendarDays, ClipboardList, ImageOff, X } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HistoryCardProps {
  scanHistory: any[];
  chatHistory: any[];
  loadingHistory: boolean;
}

export const HistoryCard = ({ scanHistory, chatHistory, loadingHistory }: HistoryCardProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedScan, setSelectedScan] = useState<any | null>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasEventsForDate = (date: Date) => {
    if (!scanHistory) return false;
    return scanHistory.some(scan => new Date(scan.created_at).toDateString() === date.toDateString());
  };

  const visibleScans = selectedDate
    ? scanHistory.filter(scan => new Date(scan.created_at).toDateString() === selectedDate.toDateString())
    : scanHistory;

  const formatDate = (date: Date | undefined) => {
    return date ? format(date, 'MMM d, yyyy') : 'All dates';
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
            className="rounded-md border pointer-events-auto"
            disabled={(date) => date > today}
            modifiers={{
              hasEvent: (date) => hasEventsForDate(date)
            }}
            modifiersClassNames={{
              hasEvent: "bg-primary/20 text-primary-foreground font-bold"
            }}
            classNames={{
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
            }}
          />
        </div>

        {selectedDate && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 text-xs text-muted-foreground"
            onClick={() => setSelectedDate(undefined)}
          >
            <X className="h-3 w-3 mr-1" />
            Clear filter ({formatDate(selectedDate)})
          </Button>
        )}

        {loadingHistory ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading history...
          </div>
        ) : (
          <>
            <h3 className="text-base font-semibold mb-2">
              {selectedDate ? `Scans for ${formatDate(selectedDate)}` : 'All Scans'}
            </h3>

            {visibleScans.length === 0 ? (
              <div className="text-center text-muted-foreground py-4 text-sm">
                {scanHistory.length === 0
                  ? "No scans yet — scan your skin to start tracking progress."
                  : "No scans for this date."}
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {visibleScans.map((scan, index) => (
                  <button
                    key={scan.id}
                    onClick={() => setSelectedScan(scan)}
                    className="w-full text-left bg-muted/70 backdrop-blur-sm rounded-lg border border-primary/10 shadow-md hover:border-primary/30 transition-colors flex items-center gap-3 p-3"
                  >
                    {scan.scan_image ? (
                      <img
                        src={scan.scan_image}
                        loading="lazy"
                        alt={`Skin scan from ${format(new Date(scan.created_at), 'MMM d, yyyy')}`}
                        className="h-14 w-14 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <ImageOff className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{format(new Date(scan.created_at), 'MMM d, yyyy')}</p>
                      <p className="text-xs text-muted-foreground truncate">Type: {scan.skin_type || '—'}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Issues: {Array.isArray(scan.skin_issues) ? scan.skin_issues.join(', ') : (scan.skin_issues || '—')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="my-4 border-t" />

            <h3 className="text-base font-semibold mb-2">Recent Chats</h3>
            {chatHistory.length > 0 ? (
              <div className="space-y-3">
                {chatHistory.slice(0, 3).map((chat, index) => (
                  <div key={chat.id} className="bg-muted/70 backdrop-blur-sm p-4 rounded-lg border border-primary/10 shadow-md">
                    <h4 className="font-medium text-sm">Chat #{index + 1}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Message: {chat.message}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">Response: {chat.response}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-2">
                No chat history found.
              </div>
            )}
          </>
        )}

        {/* Story 4.3: Scan detail dialog */}
        <Dialog open={!!selectedScan} onOpenChange={(open) => { if (!open) setSelectedScan(null); }}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedScan && `Scan — ${format(new Date(selectedScan.created_at), 'MMM d, yyyy')}`}
              </DialogTitle>
            </DialogHeader>
            {selectedScan && (
              <div className="space-y-4">
                {selectedScan.scan_image ? (
                  <img
                    src={selectedScan.scan_image}
                    loading="lazy"
                    alt={`Skin scan from ${format(new Date(selectedScan.created_at), 'MMM d, yyyy')}`}
                    className="w-full rounded-lg object-contain max-h-64"
                  />
                ) : (
                  <div className="w-full h-40 rounded-lg bg-muted flex items-center justify-center">
                    <ImageOff className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <DetailRow label="Skin Type" value={selectedScan.skin_type} />
                  <DetailRow label="Skin Tone" value={selectedScan.skin_tone} />
                  <DetailRow
                    label="Skin Issues"
                    value={Array.isArray(selectedScan.skin_issues)
                      ? selectedScan.skin_issues.join(', ')
                      : selectedScan.skin_issues}
                  />
                  <DetailRow label="Detected Condition" value={selectedScan.disease || 'None detected'} />
                  <DetailRow label="Clinical Urgency" value={selectedScan.acneSeverity || '—'} />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const DetailRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex gap-2">
    <span className="text-muted-foreground min-w-[130px] flex-shrink-0">{label}:</span>
    <span className="font-medium">{value || '—'}</span>
  </div>
);
