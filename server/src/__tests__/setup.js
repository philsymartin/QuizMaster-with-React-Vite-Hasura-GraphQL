// Load test environment variables
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Set NODE_ENV
process.env.NODE_ENV = 'test';