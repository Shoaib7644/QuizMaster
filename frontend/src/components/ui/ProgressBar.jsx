import React from 'react';

const colorForPercentage = (pct) => {
    if (pct >= 70) return 'bg-success';
    if (pct >= 40) return 'bg-warning';
    return 'bg-danger';
};

const ProgressBar = ({ percentage, showLabel = false }) => {
    const clamped = Math.max(0, Math.min(100, percentage));
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${colorForPercentage(clamped)}`}
                    style={{ width: `${clamped}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-sm font-medium text-text-primary w-12 text-right">
          {clamped.toFixed(0)}%
        </span>
            )}
        </div>
    );
};

export default ProgressBar;