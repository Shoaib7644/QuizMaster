import React from 'react';

/**
 * Base surface for every card-shaped element in the app (stat cards, quiz
 * cards, category cards). interactive=true adds the hover-lift used for
 * clickable cards; false keeps a static card flat (e.g. a stat display).
 */
const Card = ({ interactive = false, className = '', children, ...rest }) => {
    return (
        <div
            className={`
        bg-surface border border-border rounded-card p-6 shadow-sm
        ${interactive ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''}
        ${className}
      `}
            {...rest}
        >
            {children}
        </div>
    );
};

export default Card;