import React, { useState, useEffect } from 'react';

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

const emptyForm = {
    title: '',
    description: '',
    categoryId: '',
    difficulty: '',
    durationMinutes: '',
};

const QuizForm = ({
                      initialValues,
                      categories,
                      categoriesError,
                      onSubmit,
                      submitLabel,
                      submitting,
                      submitError,
                  }) => {
    const [formData, setFormData] = useState(emptyForm);
    // Question count is derived server-side from real Question rows — never
    // user-editable. Displayed for context only; not part of the submitted payload.
    const questionCount = initialValues?.totalQuestions ?? 0;

    useEffect(() => {
        if (initialValues) {
            setFormData({
                title: initialValues.title ?? '',
                description: initialValues.description ?? '',
                categoryId: initialValues.categoryId ?? '',
                difficulty: initialValues.difficulty ?? '',
                durationMinutes: initialValues.durationMinutes ?? '',
            });
        }
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            categoryId: Number(formData.categoryId),
            durationMinutes: Number(formData.durationMinutes),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700">
                    Title
                </label>
                <input
                    id="title"
                    type="text"
                    required
                    name="title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.title}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    id="description"
                    rows="4"
                    name="description"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="categoryId" className="block mb-2 text-sm font-medium text-gray-700">
                        Category
                    </label>
                    <select
                        id="categoryId"
                        name="categoryId"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.categoryId}
                        onChange={handleChange}
                        disabled={categories.length === 0}
                    >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    {categoriesError && <p className="text-red-600 text-xs mt-1">{categoriesError}</p>}
                    {!categoriesError && categories.length === 0 && (
                        <p className="text-gray-500 text-xs mt-1">No active categories yet — create one first.</p>
                    )}
                </div>

                <div>
                    <label htmlFor="difficulty" className="block mb-2 text-sm font-medium text-gray-700">
                        Difficulty
                    </label>
                    <select
                        id="difficulty"
                        name="difficulty"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.difficulty}
                        onChange={handleChange}
                    >
                        <option value="">Select Difficulty</option>
                        {DIFFICULTIES.map((d) => (
                            <option key={d} value={d}>
                                {d.charAt(0) + d.slice(1).toLowerCase()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="durationMinutes" className="block mb-2 text-sm font-medium text-gray-700">
                        Duration (minutes)
                    </label>
                    <input
                        id="durationMinutes"
                        type="number"
                        min="1"
                        required
                        name="durationMinutes"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.durationMinutes}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <span className="block mb-2 text-sm font-medium text-gray-700">Total Questions</span>
                    <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                        {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Calculated automatically from uploaded questions — not directly editable.
                    </p>
                </div>
            </div>

            {submitError && <p className="text-red-600 text-sm">{submitError}</p>}

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
                >
                    {submitting ? `${submitLabel}...` : submitLabel}
                </button>
            </div>
        </form>
    );
};

export default QuizForm;