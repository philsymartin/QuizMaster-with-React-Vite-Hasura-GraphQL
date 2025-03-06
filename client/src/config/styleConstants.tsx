export const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default: return '';
    }
};

export const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
        case 'positive':
            return 'bg-green-500';
        case 'negative':
            return 'bg-red-500';
        default:
            return 'bg-gray-500';
    }
};

export const BarChartHorizontalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 16h8" />
        <path d="M7 11h12" />
        <path d="M7 6h3" />
    </svg>
);