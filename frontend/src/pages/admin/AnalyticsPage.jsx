import React from 'react';
import { BarChart3 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';

const AnalyticsPage = () => {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <PageHeader title="Analytics" subtitle="Platform-wide quiz performance and usage." />
            <Card className="text-center py-16">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <BarChart3 size={26} className="text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary mt-4">Coming soon</h2>
                <p className="text-text-secondary mt-1 max-w-sm mx-auto">
                    Platform statistics will appear here once analytics reporting is available.
                </p>
            </Card>
        </div>
    );
};

export default AnalyticsPage;