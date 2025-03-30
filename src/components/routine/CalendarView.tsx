
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import RoutineLegend from './RoutineLegend';

interface CalendarViewProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  getDateStatus: (date: Date) => 'none' | 'both' | 'morning' | 'evening';
}

const CalendarView = ({ selectedDate, setSelectedDate, getDateStatus }: CalendarViewProps) => {
  return (
    <div className="col-span-2">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-md border pointer-events-auto bg-card"
        modifiers={{
          routine: (date) => getDateStatus(date) !== 'none'
        }}
        modifiersClassNames={{
          routine: ""
        }}
        components={{
          Day: ({ date, ...props }) => {
            const status = getDateStatus(date);
            return (
              <button
                {...props}
                className={cn(
                  (props as any)?.className ?? '',
                  {
                    "bg-amber-200 text-amber-800 font-medium hover:bg-amber-300": status === 'morning',
                    "bg-blue-200 text-blue-800 font-medium hover:bg-blue-300": status === 'evening',
                    "bg-green-200 text-green-800 font-medium hover:bg-green-300": status === 'both'
                  }
                )}
              />
            );
          }
        }}
      />
      <RoutineLegend />
    </div>
  );
};

export default CalendarView;
