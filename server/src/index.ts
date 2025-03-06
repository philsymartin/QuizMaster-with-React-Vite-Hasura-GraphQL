import express, { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import axios, { AxiosError } from 'axios';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { JwtPayload } from 'jsonwebtoken';
import ms from 'ms';
import { HasuraClaims, HasuraResponse, LeaderboardQueryResult, LoginRequest, RegisterRequest, TimeString, User, UserResponse } from './types/indexTypes';
import analysisRoutes from './routes/analysisApi';
import { asyncHandler } from './middleware/asyncHandler';
dotenv.config();

const PORT = process.env.PORT || 5000;
const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const HASURA_ORIGIN = process.env.HASURA_ORIGIN || "http://localhost:8080";
const ACCESS_TOKEN_MAX_AGE = ms((process.env.JWT_ACCESS_TOKEN_EXPIRATION || '30m') as TimeString);
const REFRESH_TOKEN_MAX_AGE = ms((process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d') as TimeString);
if (!HASURA_ENDPOINT || !HASURA_ADMIN_SECRET || !FRONTEND_URL || !JWT_ACCESS_SECRET) {
    throw new Error('Missing required environment variables');
}

const app = express();
// Middleware setup
app.use(express.json());
app.use(cors({ origin: [FRONTEND_URL, HASURA_ORIGIN], credentials: true }));
app.use(cookieParser());

app.use('/analysis', analysisRoutes);

app.post('/login', asyncHandler(async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const { email, password } = req.body;

    const userResponse = await axios.post<HasuraResponse<UserResponse>>(
        HASURA_ENDPOINT!,
        {
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
        },
        {
            headers: {
                'x-hasura-admin-secret': HASURA_ADMIN_SECRET!,
                Authorization: `Bearer ${req.cookies.access_token}`
            }
        }
    );

    if (userResponse.data.errors) {
        console.error("Hasura Error:", userResponse.data.errors);
        return res.status(500).json({ message: "Database error", errors: userResponse.data.errors });
    }
    if (!userResponse.data?.data?.users.length) {
        return res.status(400).json({ message: 'User not found' });
    }

    const user = userResponse.data.data.users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const hasuraClaims: HasuraClaims = {
        "x-hasura-allowed-roles": [user.role],
        "x-hasura-default-role": user.role,
        "x-hasura-user-id": user.user_id.toString()
    };
    // Add admin secret to claims if user is admin
    if (user.role === 'admin') {
        hasuraClaims["x-hasura-admin-secret"] = HASURA_ADMIN_SECRET;
    }
    // Generate access token with Hasura claims
    const accessToken = jwt.sign(
        {
            userId: user.user_id,
            role: user.role,
            "https://hasura.io/jwt/claims": hasuraClaims
        },
        JWT_ACCESS_SECRET as jwt.Secret,
        { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION } as jwt.SignOptions
    );
    const refreshToken = jwt.sign(
        { userId: user.user_id, role: user.role },
        process.env.JWT_REFRESH_TOKEN_SECRET as jwt.Secret,
        { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION } as jwt.SignOptions
    );
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ACCESS_TOKEN_MAX_AGE
    });
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_TOKEN_MAX_AGE
    });

    if (user.role === 'admin') {
        res.cookie('hasura_admin_secret', HASURA_ADMIN_SECRET, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
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

app.post('/refresh-token', asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Unauthorized: No refresh token provided' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET as jwt.Secret, (err: jwt.VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (err || typeof decoded !== 'object' || !decoded.userId) {
            return res.status(403).json({ message: 'Forbidden: Invalid refresh token' });
        }
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) {
            return res.status(401).json({ message: 'Refresh token expired' });
        }
        // Prepare Hasura claims
        const hasuraClaims: HasuraClaims = {
            "x-hasura-allowed-roles": [decoded.role],
            "x-hasura-default-role": decoded.role,
            "x-hasura-user-id": decoded.userId.toString()
        };

        // Add admin secret to claims if user is admin
        if (decoded.role === 'admin') {
            hasuraClaims["x-hasura-admin-secret"] = HASURA_ADMIN_SECRET;
        }

        const newAccessToken = jwt.sign(
            {
                userId: decoded.userId,
                role: decoded.role,
                "https://hasura.io/jwt/claims": hasuraClaims
            },
            JWT_ACCESS_SECRET as jwt.Secret,
            { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION } as jwt.SignOptions
        );

        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: ACCESS_TOKEN_MAX_AGE
        });
        return res.status(200).json({
            message: 'Token refreshed successfully',
            accessToken: newAccessToken,
            expiresIn: ACCESS_TOKEN_MAX_AGE / 1000
        });
    });
}));

app.post('/register', asyncHandler(async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userResponse = await axios.post<HasuraResponse<{ users: User[] }>>(
        HASURA_ENDPOINT!,
        {
            query: `
                query GetUserByEmail($email: String!) {
                    users(where: {email: {_eq: $email}}) {
                        user_id
                    }
                }
            `,
            variables: { email },
        },
        { headers: { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET! } }
    );

    if (userResponse.data?.data?.users.length) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createUserResponse = await axios.post<HasuraResponse<{ insert_users: { returning: User[] } }>>(
        HASURA_ENDPOINT!,
        {
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
        },
        { headers: { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET! } }
    );

    if (!createUserResponse.data?.data?.insert_users.returning.length) {
        return res.status(500).json({ message: 'User registration failed' });
    }

    return res.status(201).json({ message: 'Registration successful' });
}));


app.post('/logout', (req: Request, res: Response) => {
    res.cookie('access_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0),
    });
    res.cookie('refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0),
    });
    res.cookie('hasura_admin_secret', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logout successful' });
});
app.get('/leaderboard', asyncHandler(async (req: Request, res: Response) => {
    try {
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
            return res.status(500).json({ message: "Database error", errors: response.data.errors });
        }
        return res.json(response.data.data);
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        return res.status(500).json({ message: 'Error fetching leaderboard data' });
    }
}));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;
