"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const asyncHandler_1 = require("../middleware/asyncHandler");
dotenv_1.default.config();
const router = express_1.default.Router();
const HUGGING_FACE_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;
const HF_SENTIMENT_API_URL = process.env.HF_SENTIMENT_API_URL;
const HF_KEYWORD_MODEL_API_URL = process.env.HF_KEYWORD_MODEL_API_URL;
if (!HUGGING_FACE_API_TOKEN) {
    console.error('HUGGING_FACE_API_TOKEN is not set');
}
if (!HF_SENTIMENT_API_URL || !HF_KEYWORD_MODEL_API_URL) {
    console.error('HUGGING_FACE URL IS MISSING');
}
router.post('/sentiment', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
        const response = await axios_1.default.post(HF_SENTIMENT_API_URL, { inputs: text }, {
            headers: {
                'Authorization': `Bearer ${HUGGING_FACE_API_TOKEN}`,
                'Content-Type': 'application/json',
            }
        });
        console.log('Raw Hugging Face API response:', response.data);
        if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
            throw new Error('Invalid response from Hugging Face API');
        }
        // Map the sentiment labels to match your frontend expectations
        const resultMapping = {
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
    }
    catch (error) {
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
router.post('/keywords', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { feedbackItems } = req.body;
    if (!Array.isArray(feedbackItems)) {
        return res.status(400).json({ message: 'feedbackItems must be an array' });
    }
    try {
        // Extract keywords from each feedback item
        const processedItems = await Promise.all(feedbackItems.map(async (item) => {
            try {
                console.log(`Processing text: "${item.text.substring(0, 50)}..."`);
                const response = await axios_1.default.post(HF_KEYWORD_MODEL_API_URL, { inputs: item.text }, {
                    headers: {
                        'Authorization': `Bearer ${HUGGING_FACE_API_TOKEN}`,
                        'Content-Type': 'application/json',
                    }
                });
                console.log('HF Keyword API response:', JSON.stringify(response.data));
                let keywords = [];
                if (Array.isArray(response.data) && response.data.length === 0) {
                    console.log('Empty keyphrase result - currently not extracting words from text');
                }
                // Handle format where response.data is an array of objects with 'word' property
                else if (Array.isArray(response.data) && response.data.length > 0) {
                    // Updated to handle the actual structure returned from the API
                    keywords = response.data
                        .map((k) => k.word?.trim().toLowerCase())
                        .filter(Boolean);
                }
                return {
                    feedback_id: item.feedback_id,
                    text: item.text,
                    keywords: keywords,
                };
            }
            catch (error) {
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
        }));
        const feedbackKeywords = processedItems.map(item => ({
            feedback_id: item.feedback_id,
            keywords: item.keywords
        }));
        return res.json({
            totalFeedback: feedbackItems.length,
            feedbackKeywords
        });
    }
    catch (error) {
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
exports.default = router;
