import { test, describe, before, after } from 'node:test';
import assert from 'assert';
import http from 'http';
import app from '../src/server.js';
import db from '../src/config/database.js';

let server;
let baseUrl;
let userToken;
let createdTripId;
let shareCode;

describe('GlobeTrotter Backend - Trip Management & Wizard API Test Suite', () => {
  before(async () => {
    db.prepare("DELETE FROM users WHERE email LIKE '%trip_mgmt_test%'").run();

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
    db.prepare("DELETE FROM users WHERE email LIKE '%trip_mgmt_test%'").run();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1. Preset Cover Photos - Should return list of preset cover photos', async () => {
    const res = await fetch(`${baseUrl}/api/trips/presets/photos`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.presetPhotos));
    assert.ok(data.presetPhotos.length > 0);
  });

  test('2. Setup - Register User for Trip Management', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Wizard Traveler',
        email: 'trip_mgmt_test@example.com',
        password: 'password123',
        bio: 'Explorer of rare destinations'
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    userToken = data.token;
  });

  test('3. Create Trip Wizard - Should create trip with stop count and cover photo', async () => {
    const tripPayload = {
      trip_name: 'Summer Alpine Trek 2026',
      destination_location: 'Swiss Alps, Switzerland',
      description: 'Glacier hiking and panoramic train rides across Zermatt.',
      cover_photo_url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99',
      start_date: '2026-07-01',
      end_date: '2026-07-10',
      total_budget: 2800,
      stop_count: 3,
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
    assert.strictEqual(data.trip.trip_name, 'Summer Alpine Trek 2026');
    assert.strictEqual(data.trip.stop_count, 3);
    assert.ok(data.trip.share_code);
    createdTripId = data.trip.id;
    shareCode = data.trip.share_code;
  });

  test('4. Filterable & Searchable Trip List - Should filter trips by status and search term', async () => {
    // Also create a second completed trip
    await fetch(`${baseUrl}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        trip_name: 'Kyoto Tea Ceremony',
        destination_location: 'Kyoto, Japan',
        start_date: '2025-04-01',
        end_date: '2025-04-07',
        total_budget: 1400,
        status: 'completed'
      })
    });

    // Test filter status = upcoming
    const resUpcoming = await fetch(`${baseUrl}/api/trips?status=upcoming`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const dataUpcoming = await resUpcoming.json();
    assert.strictEqual(resUpcoming.status, 200);
    assert.strictEqual(dataUpcoming.trips.length, 1);
    assert.strictEqual(dataUpcoming.trips[0].status, 'upcoming');

    // Test search query = "Alpine"
    const resSearch = await fetch(`${baseUrl}/api/trips?search=Alpine`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const dataSearch = await resSearch.json();
    assert.strictEqual(resSearch.status, 200);
    assert.strictEqual(dataSearch.trips.length, 1);
    assert.strictEqual(dataSearch.trips[0].trip_name, 'Summer Alpine Trek 2026');
  });

  test('5. Update Trip - Should update trip details', async () => {
    const res = await fetch(`${baseUrl}/api/trips/${createdTripId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        trip_name: 'Extended Alpine Trek 2026',
        total_budget: 3200,
        stop_count: 5,
        status: 'ongoing'
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.trip.trip_name, 'Extended Alpine Trek 2026');
    assert.strictEqual(data.trip.total_budget, 3200);
    assert.strictEqual(data.trip.stop_count, 5);
    assert.strictEqual(data.trip.status, 'ongoing');
  });

  test('6. Public Share Link - Should view trip via share_code without authentication', async () => {
    const res = await fetch(`${baseUrl}/api/trips/share/${shareCode}`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.trip.share_code, shareCode);
    assert.strictEqual(data.trip.owner_name, 'Wizard Traveler');
  });

  test('7. Delete Trip - Should delete trip', async () => {
    const res = await fetch(`${baseUrl}/api/trips/${createdTripId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
  });
});
