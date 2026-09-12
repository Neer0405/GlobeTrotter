import { test, describe, before, after } from 'node:test';
import assert from 'assert';
import http from 'http';
import app from '../src/server.js';
import db from '../src/config/database.js';

let server;
let baseUrl;
let userToken;
let tripId;
let stopId1;
let stopId2;

describe('GlobeTrotter Backend - Itinerary Builder & City Explorer Test Suite', () => {
  before(async () => {
    db.prepare("DELETE FROM users WHERE email LIKE '%itin_test%'").run();

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
    db.prepare("DELETE FROM users WHERE email LIKE '%itin_test%'").run();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1. Setup - Register User & Create Trip', async () => {
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Itinerary Tester',
        email: 'itin_test@example.com',
        password: 'password123'
      })
    });
    const regData = await regRes.json();
    userToken = regData.token;

    const tripRes = await fetch(`${baseUrl}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        trip_name: 'Grand European Tour 2026',
        destination_location: 'Europe',
        start_date: '2026-08-01',
        end_date: '2026-08-15',
        total_budget: 4500
      })
    });
    const tripData = await tripRes.json();
    tripId = tripData.trip.id;
  });

  test('2. Multi-Stop Manager - Should add city stops to trip', async () => {
    // Add Stop 1: Paris
    const res1 = await fetch(`${baseUrl}/api/trips/${tripId}/stops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        city_name: 'Paris',
        country: 'France',
        arrival_date: '2026-08-01',
        departure_date: '2026-08-05',
        stay_days: 4
      })
    });
    const data1 = await res1.json();
    assert.strictEqual(res1.status, 201);
    assert.strictEqual(data1.stop.city_name, 'Paris');
    stopId1 = data1.stop.id;

    // Add Stop 2: Venice
    const res2 = await fetch(`${baseUrl}/api/trips/${tripId}/stops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        city_name: 'Venice',
        country: 'Italy',
        arrival_date: '2026-08-06',
        departure_date: '2026-08-10',
        stay_days: 4
      })
    });
    const data2 = await res2.json();
    assert.strictEqual(res2.status, 201);
    stopId2 = data2.stop.id;
  });

  test('3. Stop Reordering - Should reorder city stops rank order', async () => {
    const res = await fetch(`${baseUrl}/api/trips/${tripId}/stops/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        stops: [
          { id: stopId2, stop_order: 1 },
          { id: stopId1, stop_order: 2 }
        ]
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.stops[0].id, stopId2);
    assert.strictEqual(data.stops[1].id, stopId1);
  });

  test('4. Activity Assignment - Should assign activity to specific stop/day', async () => {
    const res = await fetch(`${baseUrl}/api/trips/${tripId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        stop_id: stopId1,
        day_number: 1,
        title: 'Eiffel Tower Sunset Tour',
        location: 'Champ de Mars, Paris',
        time_slot: '18:00',
        duration: '2 hours',
        cost: 65,
        category: 'Sightseeing'
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.activity.title, 'Eiffel Tower Sunset Tour');
    assert.strictEqual(data.activity.cost, 65);
  });

  test('5. Full Itinerary Breakdown - Should return structured day-by-day itinerary', async () => {
    const res = await fetch(`${baseUrl}/api/trips/${tripId}/full-itinerary`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.stops.length, 2);
    assert.strictEqual(data.itineraryDays.length, 1);
    assert.strictEqual(data.itineraryDays[0].activities[0].title, 'Eiffel Tower Sunset Tour');
  });

  test('6. City Search & Explorer - Should search & filter cities by region and cost_index', async () => {
    const res = await fetch(`${baseUrl}/api/cities?region=Europe&cost_index=$$$$`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.cities));
    assert.ok(data.cities.some(c => c.city_name === 'Santorini' || c.city_name === 'Paris'));
  });

  test('7. Add City to Trip Action - Should add city directly from Explorer to trip', async () => {
    // Get Kyoto city ID
    const citiesRes = await fetch(`${baseUrl}/api/cities?search=Kyoto`);
    const citiesData = await citiesRes.json();
    const kyotoId = citiesData.cities[0].id;

    const addRes = await fetch(`${baseUrl}/api/cities/${kyotoId}/add-to-trip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        trip_id: tripId,
        stay_days: 3
      })
    });

    const addData = await addRes.json();
    assert.strictEqual(addRes.status, 201);
    assert.strictEqual(addData.success, true);
    assert.strictEqual(addData.stop.city_name, 'Kyoto');
  });
});
