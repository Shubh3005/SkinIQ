
export const RoutineCalendarLegend = () => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm bg-green-200 border-b-2 border-b-green-600 border border-green-400"></div>
        <span className="text-sm">Both Routines</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm bg-amber-200 border-b-2 border-b-amber-600 border border-amber-400"></div>
        <span className="text-sm">Morning Only</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm bg-blue-200 border-b-2 border-b-blue-600 border border-blue-400"></div>
        <span className="text-sm">Evening Only</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm bg-muted border border-muted-foreground/30"></div>
        <span className="text-sm">No Data</span>
      </div>
    </div>
  );
};
