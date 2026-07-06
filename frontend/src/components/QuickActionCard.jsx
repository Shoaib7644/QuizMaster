import React from 'react';
import { BookOpen, Target, Award, PlayCircle, Grid, Trophy, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from './ui/Card';

const QuickActionCard = ({ icon: Icon, title, description, to }) => {
    return (
        <Link to={to}>
            <Card interactive>
                {Icon && (
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <Icon size={18} className="text-primary" />
                    </div>
                )}
                <p className="font-semibold text-text-primary">{title}</p>
                <p className="text-sm text-text-secondary mt-1">{description}</p>
            </Card>
        </Link>
    );
};

export default QuickActionCard;