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
        minQuizzes: 1,
        difficulty: 'all',
        sortBy: 'score'
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

    // Process raw data into leaderboard entries
    const leaderboardData: LeaderboardEntry[] = useMemo(() => {
        if (!data?.users) return [];

        return data.users.map((user: ExtendedUser) => {
            // Filter out users with no attempts
            if (!user.quiz_attempts || user.quiz_attempts.length === 0) {
                return null;
            }
            const attempts = user.quiz_attempts || [];


            // Find best performance
            const bestAttempt = attempts.reduce(
                (best: QuizAttemptWithQuiz | null, current: QuizAttemptWithQuiz) =>
                    best === null || current.score > best.score ? current : best,
                null
            );

            // Get unique completed quizzes
            const completedQuizzes = [...new Set(attempts.map(a => a.quiz.title))];

            // Calculate average scores per quiz
            const quizScores = completedQuizzes.map(quizTitle => {
                const quizAttempts = attempts.filter(a => a.quiz.title === quizTitle);
                const avgScore = quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length;
                const bestScore = Math.max(...quizAttempts.map(a => a.score));

                return {
                    quizId: quizAttempts[0].quiz_id,
                    quizTitle,
                    score: avgScore,
                    bestScore,
                    attempts: quizAttempts.length
                };
            });

            // Calculate overall average score weighted by number of questions
            const totalAttempts = attempts.length;
            const totalScoreSum = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
            const averageScore = totalAttempts > 0 ? totalScoreSum / totalAttempts : 0;

            return {
                userId: user.user_id,
                username: user.username,
                totalQuizzes: completedQuizzes.length,
                averageScore,
                topPerformance: bestAttempt
                    ? `${bestAttempt.quiz.title} (${bestAttempt.score.toFixed(1)}%)`
                    : 'No attempts yet',
                completedQuizzes,
                quizScores,
                lastActive: user.last_active
            };
        }).filter(Boolean) as LeaderboardEntry[];
    }, [data]);

    // Get unique quizzes for filter options
    const quizOptions = useMemo(() => {
        const quizzes = new Set<string>();
        leaderboardData.forEach(user => {
            user.quizScores.forEach(score => {
                quizzes.add(score.quizTitle);
            });
        });
        return Array.from(quizzes).sort();
    }, [leaderboardData]);

    // Filter and sort leaderboard data
    const filteredLeaderboard = useMemo(() => {
        return leaderboardData
            .filter(user => {
                // Search filter
                const matchesSearch = user.username.toLowerCase().includes(filters.search.toLowerCase());

                // Quiz filter
                const matchesQuiz = filters.quizId === 'all' || user.quizScores.some(
                    score => score.quizTitle === filters.quizId
                );

                // Score range filter
                let scoreToCheck = user.averageScore;
                if (filters.quizId !== 'all') {
                    const quizScore = user.quizScores.find(s => s.quizTitle === filters.quizId);
                    scoreToCheck = quizScore ? quizScore.score : 0;
                }

                const matchesScoreRange = scoreToCheck >= filters.scoreRange.min &&
                    scoreToCheck <= filters.scoreRange.max;

                // Minimum quizzes filter
                const matchesMinQuizzes = user.totalQuizzes >= filters.minQuizzes;

                return matchesSearch && matchesQuiz && matchesScoreRange && matchesMinQuizzes;
            })
            .sort((a, b) => {
                // Sort based on selected criteria
                switch (filters.sortBy) {
                    case 'quizzes':
                        return b.totalQuizzes - a.totalQuizzes;
                    case 'score':
                    default:
                        if (filters.quizId === 'all') {
                            return b.averageScore - a.averageScore;
                        }

                        const aScore = a.quizScores.find(s => s.quizTitle === filters.quizId)?.score || 0;
                        const bScore = b.quizScores.find(s => s.quizTitle === filters.quizId)?.score || 0;
                        return bScore - aScore;
                }
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