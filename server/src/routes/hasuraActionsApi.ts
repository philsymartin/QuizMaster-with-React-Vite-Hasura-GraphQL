import express from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import axios from 'axios';
import dotenv from 'dotenv';
import { HasuraResponse, LeaderboardQueryResult } from '../types/indexTypes';

dotenv.config();
const router = express.Router();
const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

// Hasura Action handler for leaderboard
router.post('/fetchLeaderboard', asyncHandler(async (req, res) => {
    try {
        // Query Hasura directly for the leaderboard data
        const response = await axios.post<HasuraResponse<LeaderboardQueryResult>>(
            HASURA_ENDPOINT!,
            {
                query: `
          query GetLeaderboardData {
            users(
              where: {
                _and: [
                  { role: { _eq: "user" } },
                  { quiz_attempts: { end_time: { _is_null: false } } }  
                ]
              }
            ) {
              user_id
              username
              last_active
              user_performances {
                quiz_id
                total_attempts
                correct_answers
                average_score
                quiz {
                  title
                  total_questions
                }
              }
              quiz_attempts(
                where: { end_time: { _is_null: false } }  
                order_by: { score: desc } 
              ) {
                quiz_id
                score
                quiz {
                  title
                }
              }
            }
          }
        `
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-hasura-admin-secret': HASURA_ADMIN_SECRET!
                }
            }
        );

        if (response.data.errors) {
            console.error("Hasura Error:", response.data.errors);
            return res.status(500).json({
                message: "Database error",
                errors: response.data.errors
            });
        }
        return res.json(response.data.data);
    } catch (error) {
        console.error('Error in fetchLeaderboard action:', error);
        return res.status(500).json({
            message: 'Error fetching leaderboard data'
        });
    }
}));

export default router;