import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Terminal, Leaf, Container, BookOpen } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

// Heuristic icon match by keyword in the category name. Falls back to a
// generic book icon for anything unrecognized — categories are
// admin-created free text, so there's no fixed enum to switch on.
const ICON_RULES = [
    { keywords: ['java'], icon: Coffee },
    { keywords: ['python'], icon: Terminal },
    { keywords: ['spring'], icon: Leaf },
    { keywords: ['docker'], icon: Container },
];

const iconForCategory = (name = '') => {
    const lower = name.toLowerCase();
    const match = ICON_RULES.find((rule) => rule.keywords.some((k) => lower.includes(k)));
    return match ? match.icon : BookOpen;
};

/**
 * quizCount: pass this in from the caller. CategoryResponse from the
 * backend doesn't carry a quiz count field, so callers should derive it
 * client-side (group already-fetched quizzes by categoryId) rather than
 * this component calling any API itself — keeps this component a pure
 * presentation piece with no data-fetching responsibility of its own.
 */
const CategoryCard = ({ category, quizCount }) => {
    const Icon = iconForCategory(category.name);

    return (
        <Card interactive className="text-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Icon size={22} className="text-primary" />
            </div>
            <h3 className="font-semibold text-text-primary mt-4">{category.name}</h3>
            {typeof quizCount === 'number' && (
                <p className="text-sm text-text-secondary mt-1">{quizCount} quizzes</p>
            )}
            {category.description && (
                <p className="text-sm text-text-secondary mt-2 line-clamp-2">{category.description}</p>
            )}
            <Link to={`/categories/${category.id}`}>
                <Button variant="secondary" size="sm" className="mt-4 w-full">
                    Browse
                </Button>
            </Link>
        </Card>
    );
};

export default CategoryCard;