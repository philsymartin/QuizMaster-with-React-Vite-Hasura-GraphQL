import { LEADERBOARD_QUERY } from "@queries/users";
import client from "@services/hasuraApi";

const API_URL = import.meta.env.VITE_API_URL as string;

export const fetchLeaderboardData = async (isAdmin: boolean) => {
    if (isAdmin) {
        // If admin, use direct GraphQL query
        const result = await client.query({
            query: LEADERBOARD_QUERY,
            fetchPolicy: 'network-only'
        });
        return result.data;
    } else {
        // If not admin, use backend endpoint
        const response = await fetch(`${API_URL}/leaderboard`);
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard data');
        }
        return response.json();
    }
};