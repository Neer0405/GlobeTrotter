import { test, describe, before, after } from 'node:test';
import assert from 'assert';
import http from 'http';
import app from '../src/server.js';
import db from '../src/config/database.js';

let server;
let baseUrl;
let userToken;
let userId;

describe('GlobeTrotter Backend - Dashboard & Trip API Test Suite', () => {
  before(async () => {
    // Clean up test users
    db.prepare("DELETE FROM users WHERE email LIKE '%dashboard_test%'").run();

    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    db.prepare("DELETE FROM users WHERE email LIKE '%dashboard_test%'").run();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1. Setup - Register User for Dashboard Testing', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dashboard Tester',
        email: 'dashboard_test@example.com',
        password: 'password123',
        bio: 'Avid Globetrotter & Photographer'
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    userToken = data.token;
    userId = data.user.id;
  });

  test('2. Dashboard Summary - Should return initial stats for new user', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.welcomeMessage, 'Welcome back, Dashboard! ✨');
    assert.strictEqual(data.quickStats.totalTrips, 0);
    assert.strictEqual(data.quickStats.totalBudgetSpent, 0);
    assert.strictEqual(data.quickStats.upcomingTripsCount, 0);
    assert.strictEqual(Array.isArray(data.recentTrips), true);
  });

  test('3. Create Trip Plan - Should create a new trip and update stats', async () => {
    const tripPayload = {
      destination_title: 'Kyoto Cultural Sanctuary',
      destination_location: 'Kyoto, Japan',
      image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
      start_date: '2026-10-10',
      end_date: '2026-10-17',
      total_budget: 1450,
      status: 'upcoming'
    };

    const res = await fetch(`${baseUrl}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(tripPayload)
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.trip.destination_title, 'Kyoto Cultural Sanctuary');
    assert.strictEqual(data.trip.total_budget, 1450);
  });

  test('4. Dashboard Summary - Should reflect updated stats after trip creation', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.quickStats.totalTrips, 1);
    assert.strictEqual(data.quickStats.totalBudgetSpent, 1450);
    assert.strictEqual(data.quickStats.upcomingTripsCount, 1);
    assert.strictEqual(data.recentTrips.length, 1);
  });

  test('5. Recommendations - Should return global destinations & activity highlights', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/recommendations`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(Array.isArray(data.recommendations), true);
    assert.ok(data.recommendations.length > 0);
    assert.ok(Array.isArray(data.recommendations[0].activities));
  });
});
