import React, { useState } from 'react';
import { uploadQuestions, publishQuiz } from '../../services/quizApi';

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
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-semibold text-lg mb-2">Questions</h2>
                <p className="text-gray-600">
                    This quiz is {quiz.status.toLowerCase()} and has {quiz.totalQuestions} question(s).
                    Questions can only be uploaded while a quiz is in Draft status.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
                <h2 className="font-semibold text-lg mb-2">Upload Questions</h2>
                <p className="text-sm text-gray-600 mb-1">
                    Currently <strong>{quiz.totalQuestions}</strong> question(s) on this quiz.
                </p>
                <p className="text-xs text-gray-500">
                    CSV columns, in order: question_text, option_a, option_b, option_c, option_d,
                    correct_answer, question_type (MCQ or TRUE_FALSE). For TRUE_FALSE rows, leave
                    option_c and option_d blank and correct_answer as TRUE or FALSE.
                </p>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer"
                />
                {uploadError && <p className="text-red-600 text-sm">{uploadError}</p>}
                {uploadSuccess && <p className="text-green-700 text-sm">{uploadSuccess}</p>}
                <button
                    type="submit"
                    disabled={uploading || !file}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                    {uploading ? 'Uploading...' : 'Upload CSV'}
                </button>
            </form>

            <div className="border-t pt-4">
                {publishError && <p className="text-red-600 text-sm mb-2">{publishError}</p>}
                <button
                    type="button"
                    onClick={handlePublish}
                    disabled={!canPublish || publishing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
                    title={canPublish ? undefined : 'Upload at least one question before publishing'}
                >
                    {publishing ? 'Publishing...' : 'Publish Quiz'}
                </button>
                {!canPublish && (
                    <p className="text-xs text-gray-500 mt-1">
                        Upload at least one question before this quiz can be published.
                    </p>
                )}
            </div>
        </div>
    );
};

export default QuestionUploadPanel;