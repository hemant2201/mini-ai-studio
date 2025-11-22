import request from 'supertest';
import { createApp } from '../../../app';
import { PrismaClient } from '@prisma/client';

const app = createApp();
const prisma = new PrismaClient();

/**
 * Test Lifecycle Hooks
 * 
 * beforeAll: Run once before all tests
 * afterAll: Run once after all tests
 * beforeEach: Run before each test
 * afterEach: Run after each test
 */
describe('Auth Module', () => {
  // Clean database before all tests
  beforeAll(async () => {
    await prisma.user.deleteMany();
  });

  // Clean database after all tests
  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  /**
   * Test Suite: POST /api/auth/signup
   * Tests user registration functionality
   */
  describe('POST /api/auth/signup', () => {
    /**
     * Happy Path Test
     * Tests successful user registration
     */
    it('should create new user with valid credentials', async () => {
      // Arrange: Prepare test data
      const signupData = {
        email: 'test@example.com',
        password: 'Test123456',
      };

      // Act: Make HTTP request
      const res = await request(app)
        .post('/api/auth/signup')
        .send(signupData);

      // Assert: Check response
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(signupData.email);
      expect(res.body.data.user).not.toHaveProperty('password'); // Security check
    });

    /**
     * Validation Test: Invalid Email
     */
    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'Test123456',
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('email');
    });

    /**
     * Validation Test: Weak Password
     */
    it('should return 400 for password without uppercase', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test2@example.com',
          password: 'test123456', // No uppercase
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('uppercase');
    });

    /**
     * Validation Test: Password Too Short
     */
    it('should return 400 for password shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test3@example.com',
          password: 'Test123', // Only 7 characters
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('8 characters');
    });

    /**
     * Validation Test: Password Without Number
     */
    it('should return 400 for password without number', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test4@example.com',
          password: 'TestPassword', // No number
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('number');
    });

    /**
     * Business Rule Test: Duplicate Email
     */
    it('should return 409 for duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com', // Already exists from first test
          password: 'Test123456',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already registered');
    });

    /**
     * Validation Test: Missing Fields
     */
    it('should return 400 for missing email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          password: 'Test123456',
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test5@example.com',
        });

      expect(res.status).toBe(400);
    });
  });

  /**
   * Test Suite: POST /api/auth/login
   * Tests user authentication functionality
   */
  describe('POST /api/auth/login', () => {
    /**
     * Setup: Create a user for login tests
     */
    beforeAll(async () => {
      // Create user if not exists
      const existingUser = await prisma.user.findUnique({
        where: { email: 'login-test@example.com' },
      });

      if (!existingUser) {
        await request(app)
          .post('/api/auth/signup')
          .send({
            email: 'login-test@example.com',
            password: 'Test123456',
          });
      }
    });

    /**
     * Happy Path Test
     */
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'Test123456',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.email).toBe('login-test@example.com');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    /**
     * Security Test: Wrong Password
     */
    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'WrongPassword123',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    /**
     * Security Test: Non-existent User
     */
    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123456',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
      // Same error message prevents email enumeration
    });

    /**
     * Validation Test: Invalid Email Format
     */
    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Test123456',
        });

      expect(res.status).toBe(400);
    });

    /**
     * Validation Test: Missing Credentials
     */
    it('should return 400 for missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
        });

      expect(res.status).toBe(400);
    });
  });

  /**
   * Test Suite: GET /api/auth/me
   * Tests authenticated user retrieval
   */
  describe('GET /api/auth/me', () => {
    let authToken: string;

    /**
     * Setup: Login and get token
     */
    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'Test123456',
        });

      authToken = res.body.data.token;
    });

    /**
     * Happy Path Test
     */
    it('should return user data with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.email).toBe('login-test@example.com');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    /**
     * Security Test: No Token
     */
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('No token provided');
    });

    /**
     * Security Test: Invalid Token
     */
    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-here');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid or expired token');
    });

    /**
     * Security Test: Malformed Authorization Header
     */
    it('should return 401 without Bearer prefix', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', authToken); // Missing "Bearer "

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('No token provided');
    });
  });

  /**
   * Test Suite: 404 Handler
   * Tests undefined routes
   */
  describe('404 Handler', () => {
    it('should return 404 for undefined routes', async () => {
      const res = await request(app).get('/api/undefined-route');

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('not found');
    });
  });

  /**
   * Test Suite: Health Check
   * Tests health endpoint
   */
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('environment');
    });
  });
});