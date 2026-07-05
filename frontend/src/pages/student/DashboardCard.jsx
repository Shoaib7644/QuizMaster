import React from 'react';

const DashboardCard = ({ title, value, colorClass = 'text-blue-600' }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={`mt-2 text-3xl font-bold ${colorClass}`}>{value}</p>
        </div>
    );
};

export default DashboardCard;