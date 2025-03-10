export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
};
export const yesterdayForQuery = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0]; // Returns date in YYYY-MM-DD format
};
export const getTimeDifferenceFromNow = (date: Date): string => {
    const now = Date.now();
    const diffInMinutes = Math.floor((now - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) {
        return `just now`;
    } else if (diffInMinutes === 1) {
        return `${diffInMinutes} minute ago`;
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 120) {
        return `1 hour ago`
    } else if (diffInMinutes < 24 * 60) {
        return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else if (diffInMinutes < 24 * 60 * 2) {
        return "1 day ago";
    } else {
        return `${Math.floor(diffInMinutes / (24 * 60))} days ago`;
    }
};
// human readable to minutes for comparison
export const timeToMinutes = (timeString: string): number => {
    if (timeString.includes('minutes')) {
        return parseInt(timeString.split(' ')[0]);
    } else if (timeString.includes('hours')) {
        return parseInt(timeString.split(' ')[0]) * 60;
    } else {
        return parseInt(timeString.split(' ')[0]) * 60 * 24;
    }
};
// Helper function to calculate time taken in minutes
export const calculateTimeTaken = (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMs = end.getTime() - start.getTime();
    const diffInMinutes = Math.round(diffInMs / 60000);

    return `${diffInMinutes} min`;
};