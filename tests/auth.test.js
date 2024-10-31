const request = require('supertest');
const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');
const app = require('../src/server.js');
const User = require('../src/models/User');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.disconnect();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
});

describe('Auth Endpoints', () => {
    it('should register a new user', async () => {
        const res = await request(app).post('/api/auth/register').send({
            username: 'testuser',
            password: 'testpassword',
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
    });

    it('should login an existing user', async () => {
        await User.create({
            username: 'testuser',
            password: 'testpassword',
        });

        const res = await request(app).post('/api/auth/login').send({
            username: 'testuser',
            password: 'testpassword',
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should fail to login with incorrect credentials', async () => {
        const res = await request(app).post('/api/auth/login').send({
            username: 'testuser',
            password: 'wrongpassword',
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
});
