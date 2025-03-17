"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwt = __importStar(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const ms_1 = __importDefault(require("ms"));
const analysisApi_1 = __importDefault(require("./routes/analysisApi"));
const asyncHandler_1 = require("./middleware/asyncHandler");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const HASURA_ORIGIN = process.env.HASURA_ORIGIN || "http://localhost:8080";
const ACCESS_TOKEN_MAX_AGE = (0, ms_1.default)((process.env.JWT_ACCESS_TOKEN_EXPIRATION || '30m'));
const REFRESH_TOKEN_MAX_AGE = (0, ms_1.default)((process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d'));
if (!HASURA_ENDPOINT || !HASURA_ADMIN_SECRET || !FRONTEND_URL || !JWT_ACCESS_SECRET) {
    throw new Error('Missing required environment variables');
}
const app = (0, express_1.default)();
// Middleware setup
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: [FRONTEND_URL, HASURA_ORIGIN], credentials: true }));
app.use((0, cookie_parser_1.default)());
app.use('/analysis', analysisApi_1.default);
app.post('/login', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const userResponse = await axios_1.default.post(HASURA_ENDPOINT, {
        query: `
                    query GetUserByEmail($email: String!) {
                        users(where: {email: {_eq: $email}}) {
                            user_id
                            email
                            password
                            role
                        }
                    }
                `,
        variables: { email },
    }, {
        headers: {
            'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
            Authorization: `Bearer ${req.cookies.access_token}`
        }
    });
    if (userResponse.data.errors) {
        console.error("Hasura Error:", userResponse.data.errors);
        return res.status(500).json({ message: "Database error", errors: userResponse.data.errors });
    }
    if (!userResponse.data?.data?.users.length) {
        return res.status(400).json({ message: 'User not found' });
    }
    const user = userResponse.data.data.users[0];
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    const hasuraClaims = {
        "x-hasura-allowed-roles": [user.role],
        "x-hasura-default-role": user.role,
        "x-hasura-user-id": user.user_id.toString()
    };
    // Add admin secret to claims if user is admin
    if (user.role === 'admin') {
        hasuraClaims["x-hasura-admin-secret"] = HASURA_ADMIN_SECRET;
    }
    // Generate access token with Hasura claims
    const accessToken = jwt.sign({
        userId: user.user_id,
        role: user.role,
        "https://hasura.io/jwt/claims": hasuraClaims
    }, JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION });
    const refreshToken = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION });
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: ACCESS_TOKEN_MAX_AGE
    });
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: REFRESH_TOKEN_MAX_AGE
    });
    if (user.role === 'admin') {
        res.cookie('hasura_admin_secret', HASURA_ADMIN_SECRET, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
        });
    }
    return res.json({
        message: 'Login successful',
        user: {
            user_id: user.user_id,
            username: user.username || email.split('@')[0],
            email: user.email,
            role: user.role,
        },
        accessToken,
        expiresIn: ACCESS_TOKEN_MAX_AGE / 1000
    });
}));
app.post('/refresh-token', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Unauthorized: No refresh token provided' });
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err || typeof decoded !== 'object' || !decoded.userId) {
            return res.status(403).json({ message: 'Forbidden: Invalid refresh token' });
        }
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) {
            return res.status(401).json({ message: 'Refresh token expired' });
        }
        // Prepare Hasura claims
        const hasuraClaims = {
            "x-hasura-allowed-roles": [decoded.role],
            "x-hasura-default-role": decoded.role,
            "x-hasura-user-id": decoded.userId.toString()
        };
        // Add admin secret to claims if user is admin
        if (decoded.role === 'admin') {
            hasuraClaims["x-hasura-admin-secret"] = HASURA_ADMIN_SECRET;
        }
        const newAccessToken = jwt.sign({
            userId: decoded.userId,
            role: decoded.role,
            "https://hasura.io/jwt/claims": hasuraClaims
        }, JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION });
        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: ACCESS_TOKEN_MAX_AGE
        });
        return res.status(200).json({
            message: 'Token refreshed successfully',
            accessToken: newAccessToken,
            expiresIn: ACCESS_TOKEN_MAX_AGE / 1000
        });
    });
}));
app.post('/register', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { username, email, password } = req.body;
    // Check if user already exists
    const userResponse = await axios_1.default.post(HASURA_ENDPOINT, {
        query: `
                query GetUserByEmail($email: String!) {
                    users(where: {email: {_eq: $email}}) {
                        user_id
                    }
                }
            `,
        variables: { email },
    }, { headers: { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET } });
    if (userResponse.data?.data?.users.length) {
        return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const createUserResponse = await axios_1.default.post(HASURA_ENDPOINT, {
        query: `
                mutation RegisterUser($username: String!, $email: String!, $password: String!) {
                    insert_users(objects: {username: $username, email: $email, password: $password}) {
                        returning {
                            user_id
                            email
                            role
                        }
                    }
                }
            `,
        variables: { username, email, password: hashedPassword },
    }, { headers: { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET } });
    if (!createUserResponse.data?.data?.insert_users.returning.length) {
        return res.status(500).json({ message: 'User registration failed' });
    }
    return res.status(201).json({ message: 'Registration successful' });
}));
app.post('/logout', (req, res) => {
    res.cookie('access_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        expires: new Date(0),
    });
    res.cookie('refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        expires: new Date(0),
    });
    res.cookie('hasura_admin_secret', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logout successful' });
});
app.get('/leaderboard', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const response = await axios_1.default.post(HASURA_ENDPOINT, {
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
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': HASURA_ADMIN_SECRET
            }
        });
        if (response.data.errors) {
            console.error("Hasura Error:", response.data.errors);
            return res.status(500).json({ message: "Database error", errors: response.data.errors });
        }
        return res.json(response.data.data);
    }
    catch (error) {
        console.error('Error fetching leaderboard data:', error);
        return res.status(500).json({ message: 'Error fetching leaderboard data' });
    }
}));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});
// Start server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        // console.log(`Server running on port ${PORT}`);
    });
}
exports.default = app;
