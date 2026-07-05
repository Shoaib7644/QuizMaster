import React, { useEffect, useState } from 'react';
import { getAllCategories } from '../../services/categoryApi';
import CategoryCard from '../../pages/student/CategoryCard';

const CategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadCategories = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getAllCategories();
                if (isMounted) {
                    setCategories((data ?? []).filter((category) => category.isActive));
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Unable to load categories. Please try again.');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadCategories();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Loading categories...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <p role="alert" className="text-red-600 text-center">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
                <p className="text-gray-500 mt-1">Select a category to browse its quizzes.</p>
            </div>

            {/* Category Grid */}
            {categories.length === 0 ? (
                <p className="text-gray-500 text-center">No categories available yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;