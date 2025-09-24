// tests/payment.test.js
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || '@nee123';

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
jest.mock('axios');

const app = require('../server');
const School = require('../models/School');
const User = require('../models/User');

describe('Payment API Tests', () => {
  let authToken;
  let testSchoolId;
  let testUserId;

  beforeAll(async () => {
    // Connect to test DB
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/Edviron_test');

    // Clear existing data using direct collection operations
    await Promise.all([
      mongoose.connection.db.collection('schools').deleteMany({}),
      mongoose.connection.db.collection('users').deleteMany({}),
      mongoose.connection.db.collection('orders').deleteMany({}),
      mongoose.connection.db.collection('orderstatuses').deleteMany({})
    ]);

    // Create a test school
    const school = new School({
      name: 'Test School',
      address: '123 Test St',
      contact_email: 'school@test.com',
      phone: '9999999999',
    });
    await school.save();
    testSchoolId = school._id.toString();

    // Create a test user and generate JWT matching middleware secret
    const user = new User({
      email: 'user@test.com',
      password: 'password123',
      name: 'Test User',
      role: 'user'
    });
    await user.save();
    testUserId = user._id.toString();
    authToken = jwt.sign({ id: testUserId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Mock axios payment creation to avoid real API call
    axios.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          instrumentResponse: {
            redirectInfo: { url: 'https://mock.payment/redirect' }
          }
        }
      }
    });
  });

  afterAll(async () => {
    // Clean up test DB
    await Promise.all([
      mongoose.connection.db.collection('schools').deleteMany({}),
      mongoose.connection.db.collection('users').deleteMany({}),
      mongoose.connection.db.collection('orders').deleteMany({}),
      mongoose.connection.db.collection('orderstatuses').deleteMany({})
    ]);
    await mongoose.connection.close();
  });

  describe('POST /api/payments/create-payment', () => {
    it('should create a payment successfully', async () => {
      const response = await request(app)
        .post('/api/payments/create-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          school_id: testSchoolId,
          order_amount: 1000,
          gateway_name: 'PhonePe',
          student_info: {
            name: 'John Doe',
            email: 'john.doe@student.com',
            phone: '9999999999'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('payment_url');
      expect(response.body).toHaveProperty('custom_order_id');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/payments/create-payment')
        .send({
          school_id: testSchoolId,
          order_amount: 1000,
          gateway_name: 'PhonePe',
          student_info: {
            name: 'John Doe',
            email: 'john.doe@student.com',
            phone: '9999999999'
          }
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid data', async () => {
      const response = await request(app)
        .post('/api/payments/create-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          
          school_id: testSchoolId,
          order_amount: -100, // Invalid amount
          gateway_name: 'PhonePe',
          student_info: {
            name: '', // Invalid name
            email: 'invalid-email', // Invalid email
            phone: ''
          }
        });

      expect(response.status).toBe(400);
    });
  });
});
 