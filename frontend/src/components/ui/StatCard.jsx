import React from 'react';
import Card from './Card';

const StatCard = ({ icon: Icon, label, value, accentClassName = 'text-primary' }) => {
    return (
        <Card>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-text-secondary">{label}</p>
                    <p className={`text-2xl font-semibold mt-1 ${accentClassName}`}>{value}</p>
                </div>
                {Icon && (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon size={20} className="text-primary" />
                    </div>
                )}
            </div>
        </Card>
    );
};

export default StatCard;