import request from 'supertest';
import axios from 'axios';
import bcrypt from 'bcrypt';
import app from '..';

// Mock axios to avoid making actual HTTP requests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Auth Routes', () => {
    let mockUser: any;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup default axios mock response
        mockedAxios.post.mockImplementation(async (url: string, requestData: any) => {
            // For user lookup
            if (requestData.query && requestData.query.includes('GetUserByEmail')) {
                const email = requestData.variables.email;

                if (email === 'test@example.com') {
                    return {
                        data: {
                            data: {
                                users: [mockUser]
                            }
                        }
                    };
                } else {
                    return {
                        data: {
                            data: {
                                users: []
                            }
                        }
                    };
                }
            }
            return { data: {} };
        });
    });

    beforeAll(async () => {
        // Mock user data
        mockUser = {
            user_id: 1,
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'user'
        };
    });

    it('should return 400 if user is not found', async () => {
        const response = await request(app)
            .post('/login')
            .send({ email: 'nonexistent@example.com', password: 'wrongpassword' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User not found');
    });

    it('should return 400 if password is incorrect', async () => {
        const response = await request(app)
            .post('/login')
            .send({ email: mockUser.email, password: 'wrongpassword' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 200 and set cookies on successful login', async () => {
        const response = await request(app)
            .post('/login')
            .send({ email: mockUser.email, password: 'password123' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 if no refresh token is provided', async () => {
        const response = await request(app).post('/refresh-token');
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized: No refresh token provided');
    });
});