import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
    return (
        <Link
            to={`/categories/${category.id}`}
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border border-gray-100"
        >
            <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
            {category.description && (
                <p className="text-sm text-gray-500 mt-2">{category.description}</p>
            )}
            <p className="mt-5 text-sm text-blue-600 font-medium">Browse Quizzes →</p>
        </Link>
    );
};

export default CategoryCard;