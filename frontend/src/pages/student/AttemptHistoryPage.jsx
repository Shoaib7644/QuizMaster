import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAttemptHistory } from '../../services/attemptApi';

const PAGE_SIZE = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Assigns a sequential attempt number per quiz when the backend does not
 * already provide one. Mutates a shallow-cloned array; does not touch the
 * original data from the API.
 */
const enrichWithAttemptNumbers = (attempts) => {
    const byQuiz = {};
    attempts.forEach((a) => {
        const key = a.quizId ?? a.quizTitle ?? '_unknown';
        if (!byQuiz[key]) byQuiz[key] = [];
        byQuiz[key].push(a);
    });
    Object.values(byQuiz).forEach((group) => {
        group.sort((x, y) => new Date(x.startedAt ?? 0) - new Date(y.startedAt ?? 0));
        group.forEach((a, i) => { a.__seq = i + 1; });
    });
    return attempts.map((a) => ({
        ...a,
        _attemptNumber: a.attemptNumber ?? a.__seq ?? 1,
    }));
};

/**
 * Duration — prefers a backend-provided field; falls back to computing it
 * from startedAt / submittedAt when both are present.
 */
const getDuration = (attempt) => {
    if (attempt.durationMinutes != null) return `${attempt.durationMinutes} min`;
    if (attempt.startedAt && attempt.submittedAt) {
        const mins = Math.round(
            (new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 60_000
        );
        return mins > 0 ? `${mins} min` : '< 1 min';
    }
    return '—';
};

/** Status — uses backend field when present; infers from submittedAt otherwise. */
const resolveStatus = (attempt) => {
    if (attempt.status) return attempt.status;
    return attempt.submittedAt ? 'COMPLETED' : 'IN_PROGRESS';
};

const STATUS_META = {
    COMPLETED:   { label: 'Completed',   cls: 'bg-green-100 text-green-700'  },
    PASSED:      { label: 'Passed',      cls: 'bg-green-100 text-green-700'  },
    FAILED:      { label: 'Failed',      cls: 'bg-red-100 text-red-700'      },
    IN_PROGRESS: { label: 'In Progress', cls: 'bg-yellow-100 text-yellow-700' },
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge = ({ attempt }) => {
    const status = resolveStatus(attempt);
    const meta = STATUS_META[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${meta.cls}`}>
      {meta.label}
    </span>
    );
};

const PercentageBar = ({ value }) => {
    const pct   = typeof value === 'number' ? Math.min(100, Math.max(0, value)) : null;
    const color = pct == null ? 'bg-gray-300'
        : pct >= 75   ? 'bg-green-500'
            : pct >= 50   ? 'bg-yellow-400'
                :                'bg-red-500';
    return (
        <div className="flex items-center gap-2 min-w-[96px]">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: pct != null ? `${pct}%` : '0%' }}
                />
            </div>
            <span className="text-xs font-medium text-gray-700 tabular-nums">
        {pct != null ? `${value.toFixed(1)}%` : '—'}
      </span>
        </div>
    );
};

const Pagination = ({ page, totalPages, onPage }) => {
    if (totalPages <= 1) return null;

    // Build page number list with ellipsis
    const nums = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1);
    const withEllipsis = nums.reduce((acc, n, i, arr) => {
        if (i > 0 && n - arr[i - 1] > 1) acc.push('…');
        acc.push(n);
        return acc;
    }, []);

    const btn = (label, target, disabled, key) => (
        <button
            key={key ?? label}
            onClick={() => !disabled && onPage(target)}
            disabled={disabled}
            className={`px-3 py-1.5 text-xs rounded border transition-colors
        ${disabled
                ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-500 order-2 sm:order-1">
                Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1 order-1 sm:order-2">
                {btn('«', 1,          page === 1,          'first')}
                {btn('‹', page - 1,  page === 1,          'prev')}
                {withEllipsis.map((item, i) =>
                    item === '…'
                        ? <span key={`e${i}`} className="px-1 text-gray-400 text-xs">…</span>
                        : <button
                            key={item}
                            onClick={() => onPage(item)}
                            className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                                item === page
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >{item}</button>
                )}
                {btn('›', page + 1,  page === totalPages, 'next')}
                {btn('»', totalPages, page === totalPages, 'last')}
            </div>
        </div>
    );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const AttemptHistoryPage = () => {
    const navigate = useNavigate();

    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');

    const [search, setSearch]             = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortOrder, setSortOrder]       = useState('desc');
    const [page, setPage]                 = useState(1);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getAttemptHistory();
                if (isMounted) {
                    setAttempts(enrichWithAttemptNumbers(Array.isArray(data) ? data : []));
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Unable to load attempt history. Please try again.');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, []);

    // Unique, sorted category list extracted from the data itself
    const categories = useMemo(
        () => [...new Set(attempts.map((a) => a.categoryName).filter(Boolean))].sort(),
        [attempts]
    );

    // Filter → sort → (paginate separately)
    const filtered = useMemo(() => {
        let list = [...attempts];

        if (search.trim()) {
            const term = search.trim().toLowerCase();
            list = list.filter(
                (a) =>
                    (a.quizTitle ?? a.quizName ?? '').toLowerCase().includes(term) ||
                    (a.categoryName ?? '').toLowerCase().includes(term)
            );
        }

        if (categoryFilter) {
            list = list.filter((a) => a.categoryName === categoryFilter);
        }

        list.sort((a, b) => {
            const da = new Date(a.submittedAt ?? a.startedAt ?? 0).getTime();
            const db = new Date(b.submittedAt ?? b.startedAt ?? 0).getTime();
            return sortOrder === 'desc' ? db - da : da - db;
        });

        return list;
    }, [attempts, search, categoryFilter, sortOrder]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Helper: update filter and reset page
    const setFilter = (setter) => (value) => { setter(value); setPage(1); };

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Loading attempt history...
            </div>
        );
    }

    // ── Error ──────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="p-6">
                <p role="alert" className="text-red-600 text-center">{error}</p>
            </div>
        );
    }

    // ── Page ───────────────────────────────────────────────────────────────────
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Attempt History</h1>
                <p className="text-gray-500 mt-1">
                    {attempts.length} total {attempts.length === 1 ? 'attempt' : 'attempts'}
                </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">

                {/* Search */}
                <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
                    <input
                        type="text"
                        placeholder="Search quiz or category..."
                        value={search}
                        onChange={(e) => setFilter(setSearch)(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {search && (
                        <button
                            onClick={() => setFilter(setSearch)('')}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Category filter */}
                <select
                    value={categoryFilter}
                    onChange={(e) => setFilter(setCategoryFilter)(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                {/* Sort */}
                <select
                    value={sortOrder}
                    onChange={(e) => setFilter(setSortOrder)(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                </select>

                {/* Clear filters — shown only when active */}
                {(search || categoryFilter) && (
                    <button
                        onClick={() => { setFilter(setSearch)(''); setFilter(setCategoryFilter)(''); }}
                        className="px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg
                       hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Active filter result count */}
            {(search || categoryFilter) && (
                <p className="text-sm text-gray-500 -mt-2">
                    Showing {filtered.length} of {attempts.length} attempts
                </p>
            )}

            {/* ── Empty: no attempts at all ── */}
            {attempts.length === 0 && (
                <div className="text-center py-24">
                    <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                   M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No attempts yet.</p>
                    <p className="text-gray-400 text-sm mt-1">
                        Complete a quiz to see your history here.
                    </p>
                    <button
                        onClick={() => navigate('/quizzes')}
                        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium
                       hover:bg-blue-700 transition-colors"
                    >
                        Browse Quizzes
                    </button>
                </div>
            )}

            {/* ── Empty: filters returned nothing ── */}
            {attempts.length > 0 && filtered.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-400 text-lg font-medium">No attempts match your filters.</p>
                    <button
                        onClick={() => { setFilter(setSearch)(''); setFilter(setCategoryFilter)(''); }}
                        className="mt-3 text-sm text-blue-600 hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {/* ── Table ── */}
            {filtered.length > 0 && (
                <>
                    <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">
                                        #
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Quiz
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Score
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                                        Percentage
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                                        Duration
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                                        Attempt
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                {paginated.map((attempt, idx) => {
                                    const attemptId = attempt.id ?? attempt.attemptId;
                                    const quizId    = attempt.quizId;
                                    const date      = attempt.submittedAt ?? attempt.startedAt;
                                    const rowNum    = (page - 1) * PAGE_SIZE + idx + 1;
                                    const quizName  = attempt.quizTitle ?? attempt.quizName ?? '—';

                                    return (
                                        <tr
                                            key={attemptId ?? `${quizName}-${idx}`}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            {/* Row number */}
                                            <td className="px-4 py-3.5 text-gray-400 tabular-nums">
                                                {rowNum}
                                            </td>

                                            {/* Quiz name */}
                                            <td className="px-4 py-3.5 max-w-[180px]">
                          <span className="font-medium text-gray-800 line-clamp-1">
                            {quizName}
                          </span>
                                            </td>

                                            {/* Category */}
                                            <td className="px-4 py-3.5 text-gray-500 hidden sm:table-cell whitespace-nowrap">
                                                {attempt.categoryName ?? '—'}
                                            </td>

                                            {/* Date */}
                                            <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap hidden md:table-cell">
                                                {date
                                                    ? new Date(date).toLocaleDateString(undefined, {
                                                        day: '2-digit', month: 'short', year: 'numeric',
                                                    })
                                                    : '—'}
                                            </td>

                                            {/* Score */}
                                            <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap tabular-nums">
                                                {attempt.score != null
                                                    ? `${attempt.score}${attempt.totalQuestions != null ? ` / ${attempt.totalQuestions}` : ''}`
                                                    : '—'}
                                            </td>

                                            {/* Percentage bar */}
                                            <td className="px-4 py-3.5 hidden sm:table-cell">
                                                <PercentageBar value={attempt.percentage} />
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3.5">
                                                <StatusBadge attempt={attempt} />
                                            </td>

                                            {/* Duration */}
                                            <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap hidden lg:table-cell">
                                                {getDuration(attempt)}
                                            </td>

                                            {/* Attempt number */}
                                            <td className="px-4 py-3.5 text-gray-500 hidden lg:table-cell">
                                                #{attempt._attemptNumber}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {attemptId != null && (
                                                        <button
                                                            onClick={() => navigate(`/results/${attemptId}`)}
                                                            className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50
                                           rounded hover:bg-blue-100 transition-colors whitespace-nowrap"
                                                        >
                                                            View Result
                                                        </button>
                                                    )}
                                                    {quizId != null && (
                                                        <button
                                                            onClick={() => navigate(`/quizzes/${quizId}/details`)}
                                                            className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100
                                           rounded hover:bg-gray-200 transition-colors whitespace-nowrap"
                                                        >
                                                            Retake
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <Pagination page={page} totalPages={totalPages} onPage={setPage} />
                </>
            )}

        </div>
    );
};

export default AttemptHistoryPage;