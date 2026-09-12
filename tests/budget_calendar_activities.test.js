import { test, describe, before, after } from 'node:test';
import assert from 'assert';
import http from 'http';
import app from '../src/server.js';
import db from '../src/config/database.js';

let server;
let baseUrl;
let userToken;
let tripId;
let activityId;
let expenseId;

describe('GlobeTrotter Backend - Activity Discovery, Budget Analytics & Calendar Test Suite', () => {
  before(async () => {
    db.prepare("DELETE FROM users WHERE email LIKE '%budget_test%'").run();

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
    db.prepare("DELETE FROM users WHERE email LIKE '%budget_test%'").run();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1. Setup - Register User & Create Trip', async () => {
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Budget Tester',
        email: 'budget_test@example.com',
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
        trip_name: 'Tokyo & Kyoto Odyssey 2026',
        destination_location: 'Japan',
        start_date: '2026-10-01',
        end_date: '2026-10-05',
        total_budget: 1000 // 5 days -> $200/day target budget
      })
    });
    const tripData = await tripRes.json();
    tripId = tripData.trip.id;
  });

  test('2. Activity Search & Discovery - Should filter activities by category and cost range', async () => {
    const res = await fetch(`${baseUrl}/api/activities?category=Food&max_cost=100`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.activities));
    assert.ok(data.activities.every(a => a.category === 'Food' && a.cost <= 100));
  });

  test('3. Activity Assign & Inline Time Editing - Should assign activity and update scheduled time', async () => {
    // Assign activity
    const assignRes = await fetch(`${baseUrl}/api/trips/${tripId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        day_number: 2,
        title: 'Tsukiji Market Morning Food Crawl',
        location: 'Tsukiji, Tokyo',
        time_slot: '08:00 AM',
        duration: '2 hours',
        cost: 65,
        category: 'Food'
      })
    });
    const assignData = await assignRes.json();
    assert.strictEqual(assignRes.status, 201);
    activityId = assignData.activity.id;

    // Inline edit time slot
    const timeRes = await fetch(`${baseUrl}/api/trips/${tripId}/activities/${activityId}/time`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        time_slot: '09:30 AM',
        day_number: 2,
        duration: '2.5 hours'
      })
    });
    const timeData = await timeRes.json();
    assert.strictEqual(timeRes.status, 200);
    assert.strictEqual(timeData.activity.time_slot, '09:30 AM');
    assert.strictEqual(timeData.activity.duration, '2.5 hours');
  });

  test('4. Add Expenses & Trip Budget Analytics - Should calculate category totals and trigger Smart Budget Alert', async () => {
    // Add Expense 1 (Day 2 Transport)
    const expRes1 = await fetch(`${baseUrl}/api/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        category: 'Transport',
        amount: 150,
        day_number: 2,
        description: 'Shinkansen Bullet Train Ticket'
      })
    });
    const expData1 = await expRes1.json();
    assert.strictEqual(expRes1.status, 201);
    expenseId = expData1.expense.id;

    // Day 2 total expenditure = $65 (activity) + $150 (expense) = $215. Target daily budget = $200. Should trigger warning alert!

    const analyticsRes = await fetch(`${baseUrl}/api/trips/${tripId}/budget-analytics`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const analyticsData = await analyticsRes.json();

    assert.strictEqual(analyticsRes.status, 200);
    assert.strictEqual(analyticsData.success, true);
    assert.strictEqual(analyticsData.categoryTotals.Transport, 150);
    assert.strictEqual(analyticsData.categoryTotals.Activities, 65);
    assert.strictEqual(analyticsData.tripSummary.totalSpent, 215);

    // Verify Smart Budget Alert triggered for Day 2
    assert.ok(analyticsData.alerts.length >= 1);
    assert.strictEqual(analyticsData.alerts[0].day_number, 2);
    assert.ok(analyticsData.alerts[0].message.includes('exceeds your target daily budget'));
  });

  test('5. Delete Expense - Should update budget totals', async () => {
    const delRes = await fetch(`${baseUrl}/api/trips/${tripId}/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const delData = await delRes.json();
    assert.strictEqual(delRes.status, 200);
    assert.strictEqual(delData.success, true);

    const analyticsRes = await fetch(`${baseUrl}/api/trips/${tripId}/budget-analytics`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const analyticsData = await analyticsRes.json();
    assert.strictEqual(analyticsData.categoryTotals.Transport, 0);
  });
});
