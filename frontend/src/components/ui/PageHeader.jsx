import React from 'react';

const PageHeader = ({ title, subtitle, action }) => {
    return (
        <div className="flex items-start justify-between mb-8">
            <div>
                <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
                {subtitle && <p className="text-text-secondary mt-1">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
};

export default PageHeader;