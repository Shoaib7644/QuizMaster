import React from 'react';
import { Bell } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';

const NotificationsPage = () => {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <PageHeader title="Notifications" subtitle="Stay up to date on quiz activity." />
            <Card className="text-center py-16">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Bell size={26} className="text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary mt-4">No notifications yet</h2>
                <p className="text-text-secondary mt-1 max-w-sm mx-auto">
                    You'll see updates here once notifications are enabled.
                </p>
            </Card>
        </div>
    );
};

export default NotificationsPage;