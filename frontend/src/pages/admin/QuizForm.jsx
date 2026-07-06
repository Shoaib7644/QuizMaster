import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

const emptyForm = {
    title: '',
    description: '',
    categoryId: '',
    difficulty: '',
    durationMinutes: '',
};

const inputClass =
    'w-full px-4 py-2.5 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-slate-50 disabled:text-text-secondary';
const labelClass = 'block mb-1.5 text-sm font-medium text-text-primary';

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
                <label htmlFor="title" className={labelClass}>Title</label>
                <input
                    id="title"
                    type="text"
                    required
                    name="title"
                    className={inputClass}
                    value={formData.title}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label htmlFor="description" className={labelClass}>Description</label>
                <textarea
                    id="description"
                    rows="4"
                    name="description"
                    className={inputClass}
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="categoryId" className={labelClass}>Category</label>
                    <select
                        id="categoryId"
                        name="categoryId"
                        required
                        className={inputClass}
                        value={formData.categoryId}
                        onChange={handleChange}
                        disabled={categories.length === 0}
                    >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {categoriesError && <p className="text-danger text-xs mt-1">{categoriesError}</p>}
                    {!categoriesError && categories.length === 0 && (
                        <p className="text-text-secondary text-xs mt-1">No active categories yet — create one first.</p>
                    )}
                </div>

                <div>
                    <label htmlFor="difficulty" className={labelClass}>Difficulty</label>
                    <select
                        id="difficulty"
                        name="difficulty"
                        required
                        className={inputClass}
                        value={formData.difficulty}
                        onChange={handleChange}
                    >
                        <option value="">Select Difficulty</option>
                        {DIFFICULTIES.map((d) => (
                            <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="durationMinutes" className={labelClass}>Duration (minutes)</label>
                    <input
                        id="durationMinutes"
                        type="number"
                        min="1"
                        required
                        name="durationMinutes"
                        className={inputClass}
                        value={formData.durationMinutes}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <span className={labelClass}>Total Questions</span>
                    <div className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-text-secondary text-sm">
                        {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                        Calculated automatically from uploaded questions — not directly editable.
                    </p>
                </div>
            </div>

            {submitError && <p role="alert" className="text-danger text-sm">{submitError}</p>}

            <Button type="submit" disabled={submitting} className="w-full" size="lg">
                {submitting ? `${submitLabel}...` : submitLabel}
            </Button>
        </form>
    );
};

export default QuizForm;