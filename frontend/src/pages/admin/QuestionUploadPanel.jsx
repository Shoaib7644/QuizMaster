import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadQuestions, publishQuiz } from '../../services/quizApi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const QuestionUploadPanel = ({ quiz, onQuizUpdated, onPublished }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [publishing, setPublishing] = useState(false);
    const [publishError, setPublishError] = useState('');

    const isDraft = quiz.status === 'DRAFT';
    const canPublish = isDraft && quiz.totalQuestions > 0;

    const handleFileChange = (e) => {
        setFile(e.target.files?.[0] ?? null);
        setUploadError('');
        setUploadSuccess('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setUploadError('Please choose a CSV file first.');
            return;
        }
        setUploading(true);
        setUploadError('');
        setUploadSuccess('');
        try {
            const updatedQuiz = await uploadQuestions(quiz.id, file);
            setUploadSuccess(`Imported successfully. This quiz now has ${updatedQuiz.totalQuestions} question(s).`);
            setFile(null);
            onQuizUpdated?.(updatedQuiz);
        } catch (err) {
            setUploadError(err.message || 'Failed to upload questions.');
        } finally {
            setUploading(false);
        }
    };

    const handlePublish = async () => {
        setPublishing(true);
        setPublishError('');
        try {
            const updatedQuiz = await publishQuiz(quiz.id);
            onQuizUpdated?.(updatedQuiz);
            onPublished?.(updatedQuiz);
        } catch (err) {
            setPublishError(err.message || 'Failed to publish quiz.');
        } finally {
            setPublishing(false);
        }
    };

    if (!isDraft) {
        return (
            <Card>
                <div className="flex items-center gap-2 mb-2">
                    <h2 className="font-semibold text-text-primary">Questions</h2>
                    <Badge variant={quiz.status}>{quiz.status}</Badge>
                </div>
                <p className="text-text-secondary text-sm">
                    This quiz has {quiz.totalQuestions} question(s). Questions can only be uploaded while a quiz is in Draft status.
                </p>
            </Card>
        );
    }

    return (
        <Card className="space-y-6">
            <div>
                <h2 className="font-semibold text-text-primary mb-2">Upload Questions</h2>
                <p className="text-sm text-text-secondary mb-1">
                    Currently <strong className="text-text-primary">{quiz.totalQuestions}</strong> question(s) on this quiz.
                </p>
                <p className="text-xs text-text-secondary">
                    CSV columns, in order: question_text, option_a, option_b, option_c, option_d,
                    correct_answer, question_type (MCQ or TRUE_FALSE). For TRUE_FALSE rows, leave
                    option_c and option_d blank and correct_answer as TRUE or FALSE.
                </p>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
                <label
                    htmlFor="csv-upload"
                    className="flex items-center gap-3 border border-dashed border-border rounded-lg px-4 py-3 text-sm text-text-secondary cursor-pointer hover:border-primary hover:text-primary transition-colors"
                >
                    <Upload size={18} />
                    {file ? file.name : 'Choose a CSV file'}
                </label>
                <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                />
                {uploadError && <p role="alert" className="text-danger text-sm">{uploadError}</p>}
                {uploadSuccess && <p className="text-success text-sm">{uploadSuccess}</p>}
                <Button type="submit" disabled={uploading || !file}>
                    {uploading ? 'Uploading...' : 'Upload CSV'}
                </Button>
            </form>

            <div className="border-t border-border pt-4">
                {publishError && <p role="alert" className="text-danger text-sm mb-2">{publishError}</p>}
                <Button
                    variant="primary"
                    onClick={handlePublish}
                    disabled={!canPublish || publishing}
                    title={canPublish ? undefined : 'Upload at least one question before publishing'}
                >
                    {publishing ? 'Publishing...' : 'Publish Quiz'}
                </Button>
                {!canPublish && (
                    <p className="text-xs text-text-secondary mt-1">
                        Upload at least one question before this quiz can be published.
                    </p>
                )}
            </div>
        </Card>
    );
};

export default QuestionUploadPanel;