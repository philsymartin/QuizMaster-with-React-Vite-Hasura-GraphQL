import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_QUIZZES_WITH_TOPICS } from '@queries/quizzes';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { RoomProvider, getRoomId } from '@services/liveblocks';
import { LiveObject } from '@liveblocks/client';
import QuizzesPage from '@pages/public/QuizzesPage';

export interface QuizData {
    quiz_id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    time_limit_minutes: number;
    participants_count: number;
    average_rating: number;
    quiz_topics: {
        topic: {
            topic_id: number;
            topic_name: string;
        };
    }[];
}

export interface QuizType {
    id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    timeLimit: number;
    participants: number;
    rating: number;
    topics: string[];
}

export interface FilterState {
    search: string;
    difficulty: 'all' | 'Easy' | 'Medium' | 'Hard';
    timeRange: {
        min: number;
        max: number;
    };
    selectedTopics: string[];
}

export interface FilterOptions {
    topics: string[];
    maxTime: number;
}

const QuizzesContainer = () => {
    const { loading, error, data } = useQuery(GET_QUIZZES_WITH_TOPICS, {
        fetchPolicy: 'cache-and-network',
    });

    const [filters, setFilters] = useState<FilterState>({
        search: '',
        difficulty: 'all',
        timeRange: { min: 0, max: 0 },
        selectedTopics: [],
    });

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const transformedQuizzes: QuizType[] = useMemo(() => {
        if (!data?.quizzes) return [];

        return data.quizzes.map((quiz: QuizData): QuizType => ({
            id: quiz.quiz_id,
            title: quiz.title,
            description: quiz.description,
            difficulty: quiz.difficulty,
            timeLimit: quiz.time_limit_minutes,
            participants: quiz.participants_count,
            rating: quiz.average_rating,
            topics: quiz.quiz_topics.map(qt => qt.topic.topic_name),
        }));
    }, [data]);

    // Get filter options
    const filterOptions = useMemo(() => {
        const topics = new Set<string>();
        let maxTime = 0;

        transformedQuizzes.forEach((quiz) => {
            quiz.topics?.forEach((topic) => topics.add(topic));
            maxTime = Math.max(maxTime, quiz.timeLimit);
        });

        if (maxTime > 0 && filters.timeRange.max === 0) {
            setFilters(prev => ({
                ...prev,
                timeRange: { ...prev.timeRange, max: maxTime }
            }));
        }

        return {
            topics: Array.from(topics),
            maxTime,
        };
    }, [transformedQuizzes, filters.timeRange.max]);

    // Filter quizzes
    const filteredQuizzes = useMemo(() => {
        return transformedQuizzes.filter((quiz) => {
            const matchesSearch =
                quiz.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                quiz.description.toLowerCase().includes(filters.search.toLowerCase());

            const matchesDifficulty =
                filters.difficulty === 'all' || quiz.difficulty === filters.difficulty;

            const matchesTimeRange =
                quiz.timeLimit >= filters.timeRange.min &&
                quiz.timeLimit <= filters.timeRange.max;

            const matchesTopics =
                filters.selectedTopics.length === 0 ||
                filters.selectedTopics.some(topic => quiz.topics.includes(topic));

            return matchesSearch && matchesDifficulty && matchesTimeRange && matchesTopics;
        });
    }, [transformedQuizzes, filters]);

    // Filter handlers
    const handleSearchChange = (value: string) => {
        setFilters(prev => ({ ...prev, search: value }));
    };

    const handleDifficultyChange = (value: FilterState['difficulty']) => {
        setFilters(prev => ({ ...prev, difficulty: value }));
    };

    const handleTimeRangeChange = (type: 'min' | 'max', value: number) => {
        setFilters(prev => ({
            ...prev,
            timeRange: { ...prev.timeRange, [type]: value }
        }));
    };

    const handleTopicChange = (topic: string, checked: boolean) => {
        setFilters(prev => ({
            ...prev,
            selectedTopics: checked
                ? [...prev.selectedTopics, topic]
                : prev.selectedTopics.filter(t => t !== topic)
        }));
    };

    const handleSelectAllTopics = () => {
        setFilters(prev => ({
            ...prev,
            selectedTopics: filterOptions.topics
        }));
    };

    const handleClearAllTopics = () => {
        setFilters(prev => ({
            ...prev,
            selectedTopics: []
        }));
    };

    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    // Liveblocks setup
    const user = useSelector((state: RootState) => state.auth.user);
    const initialPresence = useMemo(() => ({
        currentPage: '/quizzes',
        isActive: true,
        lastActiveAt: new Date().toISOString(),
        userId: user?.user_id?.toString() || 'guest',
        username: user?.username || 'guest User',
        currentAction: {
            type: 'viewing' as const,
            startedAt: new Date().toISOString(),
        },
    }), [user?.user_id, user?.username]);

    const initialStorage = useMemo(() => ({
        userSessions: new LiveObject({})
    }), []);

    return (
        <RoomProvider
            id={getRoomId('admin')}
            initialPresence={initialPresence}
            initialStorage={initialStorage}
        >
            <QuizzesPage
                loading={loading}
                error={error}
                filteredQuizzes={filteredQuizzes}
                filters={filters}
                filterOptions={filterOptions}
                isFilterOpen={isFilterOpen}
                onSearchChange={handleSearchChange}
                onDifficultyChange={handleDifficultyChange}
                onTimeRangeChange={handleTimeRangeChange}
                onTopicChange={handleTopicChange}
                onSelectAllTopics={handleSelectAllTopics}
                onClearAllTopics={handleClearAllTopics}
                toggleFilter={toggleFilter}
            />
        </RoomProvider>
    );
};

export default QuizzesContainer;