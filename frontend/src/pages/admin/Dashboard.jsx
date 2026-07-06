import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FolderTree, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ADMIN_ACTIONS = [
  {
    icon: BookOpen,
    title: 'Quiz Management',
    description: 'Create, update, delete quizzes and manage questions.',
    to: '/admin/quizzes',
    cta: 'Manage Quizzes',
  },
  {
    icon: FolderTree,
    title: 'Category Management',
    description: 'Create and manage categories for quizzes.',
    to: '/admin/categories',
    cta: 'Manage Categories',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'View quiz attempts, scores, and other statistics.',
    to: '/admin/analytics',
    cta: 'View Analytics',
  },
];

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
      <div className="max-w-5xl mx-auto p-6">
        <PageHeader
            title="Admin Dashboard"
            subtitle={`Welcome, ${user?.firstName ?? 'Admin'}. Here's what you can manage today.`}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {ADMIN_ACTIONS.map(({ icon: Icon, title, description, to, cta }) => (
              <Card key={to} className="flex flex-col">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-primary" />
                </div>
                <h2 className="font-semibold text-text-primary">{title}</h2>
                <p className="text-text-secondary text-sm mt-2 flex-1">{description}</p>
                <Link to={to} className="mt-5">
                  <Button variant="secondary" className="w-full">{cta}</Button>
                </Link>
              </Card>
          ))}
        </div>
      </div>
  );
};

export default AdminDashboard;