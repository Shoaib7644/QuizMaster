import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, HelpCircle } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const QuizCard = ({ quiz, categoryName }) => {
    const navigate = useNavigate();

    return (
        <Card interactive className="flex flex-col h-full">
            <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-text-primary leading-snug">
                    {quiz.title}
                </h3>
                <Badge variant={quiz.difficulty}>{quiz.difficulty}</Badge>
            </div>

            {categoryName && (
                <span className="text-xs font-medium text-primary mt-1.5">{categoryName}</span>
            )}

            <p className="text-sm text-text-secondary mt-2 flex-1 line-clamp-2">
                {quiz.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-text-secondary mt-4">
        <span className="inline-flex items-center gap-1">
          <HelpCircle size={14} /> {quiz.totalQuestions} Questions
        </span>
                <span className="inline-flex items-center gap-1">
          <Clock size={14} /> {quiz.durationMinutes} min
        </span>
            </div>

            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border">
                <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/quizzes/${quiz.id}/details`)}
                >
                    View Details
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/quizzes/${quiz.id}`)}
                >
                    Start Quiz
                </Button>
            </div>
        </Card>
    );
};

export default QuizCard;