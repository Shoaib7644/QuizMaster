import React from 'react';
import { Link } from 'react-router-dom';

const QuickActionCard = ({ title, description, to, colorClass = 'bg-blue-600 hover:bg-blue-700' }) => {
    return (
        <Link
            to={to}
            className={`block rounded-lg p-5 text-white shadow-md transition-colors ${colorClass}`}
        >
            <p className="text-lg font-semibold">{title}</p>
            <p className="text-sm text-white/80 mt-1">{description}</p>
        </Link>
    );
};

export default QuickActionCard;