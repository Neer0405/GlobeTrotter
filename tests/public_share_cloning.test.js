import { test, describe, before, after } from 'node:test';
import assert from 'assert';
import http from 'http';
import app from '../src/server.js';
import db from '../src/config/database.js';

let server;
let baseUrl;
let creatorToken;
let clonerToken;
let shareCode;
let originalTripId;

describe('GlobeTrotter Backend - Shared / Public Itinerary & Cloning Test Suite', () => {
  before(async () => {
    db.prepare("DELETE FROM users WHERE email LIKE '%share_test%'").run();

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
    db.prepare("DELETE FROM users WHERE email LIKE '%share_test%'").run();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1. Setup - Register Creator & Cloner Users', async () => {
    // Register Creator
    const res1 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Original Creator',
        email: 'share_test_creator@example.com',
        password: 'password123'
      })
    });
    const data1 = await res1.json();
    creatorToken = data1.token;

    // Register Cloner
    const res2 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Itinerary Cloner',
        email: 'share_test_cloner@example.com',
        password: 'password123'
      })
    });
    const data2 = await res2.json();
    clonerToken = data2.token;
  });

  test('2. Create Public Trip with Stop & Activity', async () => {
    const tripRes = await fetch(`${baseUrl}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${creatorToken}`
      },
      body: JSON.stringify({
        trip_name: 'Swiss Alps Railway Escape',
        destination_location: 'Zermatt, Switzerland',
        description: 'Glacier train trip around the Matterhorn',
        start_date: '2026-11-01',
        end_date: '2026-11-07',
        total_budget: 3200,
        is_public: 1
      })
    });
    const tripData = await tripRes.json();
    originalTripId = tripData.trip.id;
    shareCode = tripData.trip.share_code;

    // Add Stop
    const stopRes = await fetch(`${baseUrl}/api/trips/${originalTripId}/stops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${creatorToken}`
      },
      body: JSON.stringify({
        city_name: 'Zermatt',
        country: 'Switzerland',
        arrival_date: '2026-11-01',
        departure_date: '2026-11-07',
        stay_days: 6
      })
    });
    const stopData = await stopRes.json();

    // Add Activity
    await fetch(`${baseUrl}/api/trips/${originalTripId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${creatorToken}`
      },
      body: JSON.stringify({
        stop_id: stopData.stop.id,
        day_number: 1,
        title: 'Gornergrat Bahn Railway Scenic Tour',
        location: 'Zermatt Station',
        time_slot: '10:00 AM',
        duration: '3 hours',
        cost: 110,
        category: 'Sightseeing'
      })
    });
  });

  test('3. Public Unauthenticated Shared Itinerary Access - Should return trip, stops, and activities', async () => {
    const res = await fetch(`${baseUrl}/api/trips/share/${shareCode}`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.trip.trip_name, 'Swiss Alps Railway Escape');
    assert.strictEqual(data.trip.owner_name, 'Original Creator');
    assert.strictEqual(data.stops.length, 1);
    assert.strictEqual(data.activities.length, 1);
    assert.strictEqual(data.activities[0].title, 'Gornergrat Bahn Railway Scenic Tour');
  });

  test('4. Clone Trip to My Account - Should clone public itinerary to new user account', async () => {
    const cloneRes = await fetch(`${baseUrl}/api/trips/share/${shareCode}/clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clonerToken}`
      }
    });

    const cloneData = await cloneRes.json();
    assert.strictEqual(cloneRes.status, 201);
    assert.strictEqual(cloneData.success, true);
    assert.ok(cloneData.trip.trip_name.includes('Swiss Alps Railway Escape (Copy)'));

    // Verify cloned trip belongs to cloner user
    const clonedTripId = cloneData.trip.id;

    const userTripsRes = await fetch(`${baseUrl}/api/trips`, {
      headers: { 'Authorization': `Bearer ${clonerToken}` }
    });
    const userTripsData = await userTripsRes.json();
    assert.ok(userTripsData.trips.some(t => t.id === clonedTripId));

    // Verify stops & activities were cloned
    const fullItinRes = await fetch(`${baseUrl}/api/trips/${clonedTripId}/full-itinerary`, {
      headers: { 'Authorization': `Bearer ${clonerToken}` }
    });
    const fullItinData = await fullItinRes.json();

    assert.strictEqual(fullItinData.stops.length, 1);
    assert.strictEqual(fullItinData.stops[0].city_name, 'Zermatt');
    assert.strictEqual(fullItinData.itineraryDays[0].activities[0].title, 'Gornergrat Bahn Railway Scenic Tour');
  });
});
