import React from 'react';

export const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[16px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.04)] animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-full" />
        ))}
      </div>
    </div>
  );
};
