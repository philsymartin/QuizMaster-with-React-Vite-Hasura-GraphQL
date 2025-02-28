import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { fetchLeaderboardData } from '@services/adminServices';
import LeaderboardPage from '@pages/public/LeaderboardPage';
import { LeaderboardEntry, FilterState, QuizAttemptWithQuiz, ExtendedUser, LeaderboardQueryResult } from 'src/types/leaderboard';

const LeaderboardContainer = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.role === 'admin';
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        quizId: 'all',
        scoreRange: { min: 40, max: 100 },
        minQuizzes: 1
    });

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [data, setData] = useState<LeaderboardQueryResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetchLeaderboardData(isAdmin);
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAdmin]);

    const leaderboardData: LeaderboardEntry[] = useMemo(() => {
        if (!data?.users) return [];

        return data.users.map((user: ExtendedUser) => {
            const performances = user.user_performances || [];
            const attempts = user.quiz_attempts || [];

            const totalCorrectAnswers = performances.reduce(
                (sum, perf) => sum + perf.correct_answers,
                0
            );

            const bestAttempt = attempts.reduce(
                (best: QuizAttemptWithQuiz, current: QuizAttemptWithQuiz) =>
                    (current.score > best.score ? current : best),
                attempts[0]
            );

            const completedQuizzes = [...new Set(attempts.map(a => a.quiz.title))] as string[];

            const quizScores = attempts.map((attempt: QuizAttemptWithQuiz) => ({
                quizId: attempt.quiz_id,
                quizTitle: attempt.quiz.title,
                score: attempt.score
            }));

            const averageScore = performances.length
                ? performances.reduce((sum, perf) => sum + perf.average_score, 0) / performances.length
                : 0;

            return {
                userId: user.user_id,
                username: user.username,
                totalQuizzes: completedQuizzes.length,
                averageScore,
                totalCorrectAnswers,
                topPerformance: bestAttempt
                    ? `${bestAttempt.quiz.title} (${bestAttempt.score}%)`
                    : 'No attempts yet',
                completedQuizzes,
                quizScores
            };
        });
    }, [data]);

    // Get unique quizzes for filter options
    const quizOptions = useMemo(() => {
        const quizzes = new Set<string>();
        leaderboardData.forEach(user => {
            user.quizScores.forEach(score => {
                quizzes.add(score.quizTitle);
            });
        });
        return Array.from(quizzes);
    }, [leaderboardData]);

    // Filter leaderboard data
    const filteredLeaderboard = useMemo(() => {
        return leaderboardData
            .filter(user => {
                const matchesSearch = user.username.toLowerCase().includes(filters.search.toLowerCase());
                const matchesQuiz = filters.quizId === 'all' || user.quizScores.some(
                    score => score.quizTitle === filters.quizId
                );
                const matchesScoreRange = user.averageScore >= filters.scoreRange.min &&
                    user.averageScore <= filters.scoreRange.max;
                const matchesMinQuizzes = user.totalQuizzes >= filters.minQuizzes;

                return matchesSearch && matchesQuiz && matchesScoreRange && matchesMinQuizzes;
            })
            .sort((a, b) => {
                if (filters.quizId === 'all') {
                    return b.averageScore - a.averageScore;
                }
                const aScore = a.quizScores.find(s => s.quizTitle === filters.quizId)?.score || 0;
                const bScore = b.quizScores.find(s => s.quizTitle === filters.quizId)?.score || 0;
                return bScore - aScore;
            });
    }, [leaderboardData, filters]);

    const updateFilters = (newFilters: Partial<FilterState>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    return (
        <LeaderboardPage
            loading={loading}
            error={error}
            filteredLeaderboard={filteredLeaderboard}
            quizOptions={quizOptions}
            filters={filters}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            updateFilters={updateFilters}
        />
    );
};

export default LeaderboardContainer;