import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/server.js';
import db, { initDb } from '../src/config/database.js';

let server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api/auth`;

describe('GlobeTrotter Backend - Authentication API Test Suite', () => {
  before(async () => {
    // Setup test DB
    initDb();
    // Clear test tables
    db.prepare('DELETE FROM password_resets').run();
    db.prepare('DELETE FROM users').run();

    await new Promise((resolve) => {
      server = app.listen(PORT, resolve);
    });
  });

  after(() => {
    if (server) server.close();
  });

  let userToken = '';
  let resetToken = '';
  const testUser = {
    name: 'Traveler Explorer',
    email: 'traveler@globetrotter.com',
    password: 'Password123!',
    confirmPassword: 'Password123!'
  };

  test('1. Registration Validation - Should reject invalid email and short password', async () => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'A',
        email: 'invalid-email',
        password: '123'
      })
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
    assert.ok(data.errors.email);
    assert.ok(data.errors.password);
  });

  test('2. Registration Validation - Should reject mismatched passwords', async () => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword'
      })
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
    assert.ok(data.errors.confirmPassword);
  });

  test('3. Register User - Should successfully register a new user & return JWT token', async () => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.email, testUser.email);
    assert.equal(data.user.name, testUser.name);

    userToken = data.token;
  });

  test('4. Register Duplicate User - Should prevent duplicate email registration', async () => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const data = await res.json();
    assert.equal(res.status, 409);
    assert.equal(data.success, false);
    assert.match(data.message, /already exists/i);
  });

  test('5. Login User - Should successfully authenticate with correct credentials', async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.email, testUser.email);
  });

  test('6. Login User - Should reject invalid password', async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'WrongPassword999'
      })
    });

    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
  });

  test('7. Protected Endpoint /me - Should fetch profile with valid JWT bearer token', async () => {
    const res = await fetch(`${BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.user.email, testUser.email);
  });

  test('8. Protected Endpoint /me - Should reject request without token', async () => {
    const res = await fetch(`${BASE_URL}/me`);

    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
  });

  test('9. Forgot Password - Should generate reset token for existing user', async () => {
    const res = await fetch(`${BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email
      })
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.resetToken);

    resetToken = data.resetToken;
  });

  test('10. Reset Password - Should update password using reset token', async () => {
    const newPass = 'BrandNewPassword2026!';
    const res = await fetch(`${BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        newPassword: newPass,
        confirmPassword: newPass
      })
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);

    // Verify login with new password
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: newPass
      })
    });

    const loginData = await loginRes.json();
    assert.equal(loginRes.status, 200);
    assert.equal(loginData.success, true);
    userToken = loginData.token;
  });

  test('11. Update Profile - Should update name and bio for authenticated user', async () => {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'Updated Traveler Name',
        bio: 'Avid world adventurer & photographer'
      })
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.user.name, 'Updated Traveler Name');
    assert.equal(data.user.bio, 'Avid world adventurer & photographer');
  });
});
