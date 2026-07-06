import React from 'react';

const VARIANTS = {
    easy: 'bg-success/10 text-success',
    medium: 'bg-warning/10 text-warning',
    hard: 'bg-danger/10 text-danger',
    draft: 'bg-slate-100 text-text-secondary',
    published: 'bg-success/10 text-success',
    archived: 'bg-amber-100 text-amber-700',
    neutral: 'bg-slate-100 text-text-secondary',
    primary: 'bg-primary/10 text-primary',
};

/**
 * variant accepts either a known key above, or any raw string (e.g. a
 * difficulty/status value straight from the API like "EASY"/"PUBLISHED") —
 * normalized to lowercase for lookup, falling back to neutral so an
 * unrecognized value never crashes, just renders unstyled-but-safe.
 */
const Badge = ({ variant = 'neutral', children }) => {
    const key = String(variant).toLowerCase();
    const styles = VARIANTS[key] || VARIANTS.neutral;
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles}`}>
      {children}
    </span>
    );
};

export default Badge;