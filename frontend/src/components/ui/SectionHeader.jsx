import React from 'react';
import { Link } from 'react-router-dom';

const SectionHeader = ({ title, actionLabel, actionTo }) => {
    return (
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            {actionLabel && actionTo && (
                <Link
                    to={actionTo}
                    className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                    {actionLabel} →
                </Link>
            )}
        </div>
    );
};

export default SectionHeader;