import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { asyncHandler } from '../middleware/asyncHandler';
import { SentimentAnalysisRequest, FeedbackItem } from '../types/analysisTypes';

dotenv.config();
const router = express.Router();
const HUGGING_FACE_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;
const HF_SENTIMENT_API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment";
const HF_KEYWORD_MODEL_API_URL = "https://api-inference.huggingface.co/models/ml6team/keyphrase-extraction-kbir-inspec";
if (!HUGGING_FACE_API_TOKEN) {
    console.error('HUGGING_FACE_API_TOKEN is not set');
}

router.post('/sentiment', asyncHandler(async (req: Request<{}, {}, SentimentAnalysisRequest>, res: Response) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: 'Text is required' });
    }
    if (!HUGGING_FACE_API_TOKEN) {
        console.error('Missing Hugging Face API token');
        return res.status(500).json({ message: 'API token not configured' });
    }
    try {
        console.log('Sending request to Hugging Face API:', { text });
        const response = await axios.post(
            HF_SENTIMENT_API_URL,
            { inputs: text },
            {
                headers: {
                    'Authorization': `Bearer ${HUGGING_FACE_API_TOKEN}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        console.log('Raw Hugging Face API response:', response.data);
        if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
            throw new Error('Invalid response from Hugging Face API');
        }
        // Map the sentiment labels to match your frontend expectations
        const resultMapping: { [key: string]: string } = {
            "LABEL_0": "NEGATIVE",
            "LABEL_1": "NEUTRAL",
            "LABEL_2": "POSITIVE"
        };
        const apiResult = response.data[0][0];
        const sentiment = {
            label: resultMapping[apiResult.label],
            score: apiResult.score
        };
        console.log('Processed sentiment result:', sentiment);
        return res.json(sentiment);
    } catch (error: any) {
        console.error('Error analyzing sentiment:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
        });
        if (error.response?.status === 503) {
            return res.status(503).json({
                message: 'The model is loading. Please try again in a few seconds.',
                error: error.response.data
            });
        }
        return res.status(500).json({
            message: 'Error analyzing sentiment',
            error: error.response?.data || error.message
        });
    }
}));

// router.post('/feedback', asyncHandler(async (req: Request<{}, {}, FeedbackAnalyticsRequest>, res: Response) => {
//     const { quiz_id, date_from, date_to } = req.body;

//     try {
//         const feedbackResponse = await axios.post(
//             HASURA_ENDPOINT!,
//             {
//                 query: `
//                     query GetFeedback($quiz_id: Int, $date_from: timestamptz, $date_to: timestamptz) {
//                         quiz_feedback(
//                             where: {
//                                 _and: [
//                                     { quiz_id: { _eq: $quiz_id } },
//                                     { created_at: { _gte: $date_from } },
//                                     { created_at: { _lte: $date_to } }
//                                 ]
//                             }
//                         ) {
//                             feedback_id
//                             feedback_text
//                             created_at
//                         }
//                     }
//                 `,
//                 variables: { quiz_id, date_from, date_to }
//             },
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'x-hasura-admin-secret': HASURA_ADMIN_SECRET!
//                 }
//             }
//         );

//         const feedbackItems = feedbackResponse.data.data.quiz_feedback;

//         const sentimentAnalysis = await Promise.all(
//             feedbackItems.map(async (item: any) => {
//                 const response = await axios.post(
//                     HF_SENTIMENT_API_URL,
//                     { inputs: item.feedback_text },
//                     {
//                         headers: {
//                             'Authorization': `Bearer ${HUGGING_FACE_API_TOKEN}`,
//                             'Content-Type': 'application/json',
//                         }
//                     }
//                 );

//                 return {
//                     feedback_id: item.feedback_id,
//                     feedback_text: item.feedback_text,
//                     sentiment: response.data[0],
//                     created_at: item.created_at
//                 };
//             })
//         );

//         const summary = {
//             total_feedback: sentimentAnalysis.length,
//             positive_feedback: sentimentAnalysis.filter(item => item.sentiment.label === 'POSITIVE').length,
//             negative_feedback: sentimentAnalysis.filter(item => item.sentiment.label === 'NEGATIVE').length,
//             average_sentiment_score: sentimentAnalysis.reduce((acc, item) => acc + item.sentiment.score, 0) / sentimentAnalysis.length
//         };

//         return res.json({
//             summary,
//             detailed_analysis: sentimentAnalysis
//         });
//     } catch (error) {
//         console.error('Error analyzing feedback:', error);
//         return res.status(500).json({ message: 'Error analyzing feedback' });
//     }
// }));

router.post('/keywords', asyncHandler(async (req: Request, res: Response) => {
    const { feedbackItems } = req.body as { feedbackItems: FeedbackItem[] };

    if (!Array.isArray(feedbackItems)) {
        return res.status(400).json({ message: 'feedbackItems must be an array' });
    }

    try {
        // Extract keywords from each feedback item
        const processedItems = await Promise.all(
            feedbackItems.map(async (item) => {
                try {
                    console.log(`Processing text: "${item.text.substring(0, 50)}..."`);
                    const response = await axios.post(
                        HF_KEYWORD_MODEL_API_URL,
                        { inputs: item.text },
                        {
                            headers: {
                                'Authorization': `Bearer ${HUGGING_FACE_API_TOKEN}`,
                                'Content-Type': 'application/json',
                            }
                        }
                    );

                    console.log('HF Keyword API response:', JSON.stringify(response.data));

                    let keywords: string[] = [];

                    if (Array.isArray(response.data) && response.data.length === 0) {
                        console.log('Empty keyphrase result - currently not extracting words from text');
                    }
                    // Handle format where response.data is an array of objects with 'word' property
                    else if (Array.isArray(response.data) && response.data.length > 0) {
                        // Updated to handle the actual structure returned from the API
                        keywords = response.data
                            .map((k: any) => k.word?.trim().toLowerCase())
                            .filter(Boolean);
                    }

                    return {
                        feedback_id: item.feedback_id,
                        text: item.text,
                        keywords: keywords,
                    };
                } catch (error: any) {
                    // If model is loading, propagate this error specifically
                    if (error.response?.status === 503 &&
                        error.response?.data?.error?.includes('currently loading')) {
                        throw error; // Re-throw to be caught by outer try/catch
                    }

                    console.error(`Error processing item: "${item.text.substring(0, 30)}..."`, error);
                    // Return item with empty keywords to allow partial results
                    return {
                        feedback_id: item.feedback_id,
                        text: item.text,
                        keywords: [],
                    };
                }
            })
        );

        const feedbackKeywords = processedItems.map(item => ({
            feedback_id: item.feedback_id,
            keywords: item.keywords
        }));

        return res.json({
            totalFeedback: feedbackItems.length,
            feedbackKeywords
        });

    } catch (error: any) {
        console.error('Error extracting keywords:', error);
        if (error.response?.status === 503 &&
            error.response?.data?.error?.includes('currently loading')) {
            return res.status(503).json({
                message: 'The keyword extraction model is loading. Please try again in a moment.',
                error: error.response?.data?.error,
                estimated_time: error.response?.data?.estimated_time
            });
        }

        return res.status(500).json({
            message: 'Error extracting keywords',
            error: error.response?.data || error.message
        });
    }
}));

export default router;