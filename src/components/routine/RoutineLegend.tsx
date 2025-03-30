
import React from 'react';

const RoutineLegend = () => {
  return (
    <div className="flex justify-center gap-6 mt-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-green-300 border border-green-500"></div>
        <span className="text-sm">Both Routines</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-amber-300 border border-amber-500"></div>
        <span className="text-sm">Morning Only</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-blue-300 border border-blue-500"></div>
        <span className="text-sm">Evening Only</span>
      </div>
    </div>
  );
};

export default RoutineLegend;
