// setupProxy.test.js
// Add these polyfills at the very top
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock the livekit-server-sdk
jest.mock('livekit-server-sdk', () => ({
  AccessToken: class MockAccessToken {
    constructor(apiKey, apiSecret, options) {
      this.apiKey = apiKey;
      this.apiSecret = apiSecret;
      this.identity = options.identity;
      this.grants = {};
    }
    
    addGrant(grant) {
      this.grants = grant;
    }
    
    async toJwt() {
      // Return a mock JWT token (valid JWT format but not real)
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({ 
        identity: this.identity,
        video: this.grants 
      })).toString('base64');
      const signature = 'mock-signature';
      return `${header}.${payload}.${signature}`;
    }
  }
}));

const request = require('supertest');
const express = require('express');
const setupProxy = require('./setupProxy');

describe('LiveKit Token Generation', () => {
  let app;
  
  beforeEach(() => {
    // Set environment variables for testing
    process.env.LIVEKIT_API_KEY = 'test-api-key';
    process.env.LIVEKIT_API_SECRET = 'test-api-secret';
    
    app = express();
    app.use(express.json());
    setupProxy(app);
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.LIVEKIT_API_KEY;
    delete process.env.LIVEKIT_API_SECRET;
  });

  test('should generate token with valid format', async () => {
    const response = await request(app)
      .post('/api/token')
      .expect(200);
    
    expect(response.body.token).toBeDefined();
    expect(response.body.token.split('.')).toHaveLength(3); // JWT format
  });

  test('should include correct room name in token', async () => {
    const response = await request(app)
      .post('/api/token')
      .expect(200);
    
    // Decode JWT payload (base64)
    const payload = JSON.parse(
      Buffer.from(response.body.token.split('.')[1], 'base64').toString()
    );
    
    expect(payload.video?.room).toBe('coaching-room');
  });
});