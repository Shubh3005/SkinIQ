
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import RoutineLegend from './RoutineLegend';
import { DayComponentProps } from 'react-day-picker';

interface CalendarViewProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  getDateStatus: (date: Date) => 'none' | 'both' | 'morning' | 'evening';
}

const CalendarView = ({ selectedDate, setSelectedDate, getDateStatus }: CalendarViewProps) => {
  return (
    <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-md border pointer-events-auto"
        modifiers={{
          routine: (date) => getDateStatus(date) !== 'none'
        }}
        modifiersClassNames={{
          routine: ""
        }}
        defaultMonth={selectedDate}
        components={{
          Day: ({ date, ...props }: DayComponentProps) => {
            const status = getDateStatus(date);
            return (
              <button
                {...props}
                className={cn(
                  props.className,
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
