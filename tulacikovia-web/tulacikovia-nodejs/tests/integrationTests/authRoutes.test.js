const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('../../src/bff/authentication/AuthRoutes.js');

const app = express();
app.use(bodyParser.json());
app.use('/register', authRoutes);

describe('Auth Routes', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: 'testPassword',
          repeatedPassword: 'testPassword',
        });
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Registration successful');
    });
  
    it('should not register a user with invalid email', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          email: 'invalid-email',
          password: 'testPassword',
          repeatedPassword: 'testPassword',
        });
  
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email is invalid');
    });
  
    /*afterAll(() => {

    });*/
  });