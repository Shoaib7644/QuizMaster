import React from 'react';
import { Trophy } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';

const LeaderboardPage = () => {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <PageHeader title="Leaderboard" subtitle="See how you rank against other students." />
            <Card className="text-center py-16">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Trophy size={26} className="text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary mt-4">Coming soon</h2>
                <p className="text-text-secondary mt-1 max-w-sm mx-auto">
                    Rankings will appear here once the leaderboard feature is available.
                </p>
            </Card>
        </div>
    );
};

export default LeaderboardPage;