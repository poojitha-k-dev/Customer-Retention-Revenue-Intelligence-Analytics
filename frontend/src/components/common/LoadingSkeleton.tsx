import React from 'react';
import { clsx } from 'clsx';

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={clsx('animate-pulse bg-slate-800/60 rounded-md', className)} />;
};

export const KPISkeleton: React.FC = () => {
  return (
    <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-5 space-y-3">
      <div className="flex justify-between items-center">
        <LoadingSkeleton className="h-4 w-24" />
        <LoadingSkeleton className="h-10 w-10 rounded-lg" />
      </div>
      <LoadingSkeleton className="h-8 w-36" />
      <LoadingSkeleton className="h-3 w-48" />
    </div>
  );
};

