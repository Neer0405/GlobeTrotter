import { test, describe, before, after } from 'node:test';
import assert from 'assert';
import http from 'http';
import app from '../src/server.js';
import db from '../src/config/database.js';

let server;
let baseUrl;
let userToken;
let adminToken;
let userId;

describe('GlobeTrotter Backend - Profile Settings, Wishlist & Admin Analytics Test Suite', () => {
  before(async () => {
    db.prepare("DELETE FROM users WHERE email LIKE '%pa_test%'").run();

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
    db.prepare("DELETE FROM users WHERE email LIKE '%pa_test%'").run();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1. Setup - Register Regular User & Admin User', async () => {
    // Register regular user
    const res1 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Profile Tester',
        email: 'pa_test_user@example.com',
        password: 'password123'
      })
    });
    const data1 = await res1.json();
    userToken = data1.token;
    userId = data1.user.id;

    // Register admin user
    const res2 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Platform Admin',
        email: 'pa_test_admin@example.com',
        password: 'password123'
      })
    });
    const data2 = await res2.json();
    adminToken = data2.token;

    // Promote admin in DB
    db.prepare("UPDATE users SET role = 'admin' WHERE email = 'pa_test_admin@example.com'").run();
  });

  test('2. Profile Editor & Preferences - Should update name, bio, currency, and language', async () => {
    const res = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'Profile Tester Updated',
        bio: 'Avid world traveler & foodie',
        currency: 'EUR',
        language: 'es'
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.name, 'Profile Tester Updated');
    assert.strictEqual(data.user.currency, 'EUR');
    assert.strictEqual(data.user.language, 'es');
  });

  test('3. Saved Wishlist - Should add item, fetch wishlist, and remove item', async () => {
    // Add item
    const addRes = await fetch(`${baseUrl}/api/auth/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        title: 'Kyoto Cultural Sanctuary',
        location: 'Kyoto, Japan',
        image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
        item_type: 'destination'
      })
    });
    const addData = await addRes.json();
    assert.strictEqual(addRes.status, 201);
    assert.strictEqual(addData.success, true);

    const itemId = addData.wishlistItem.id;

    // Fetch wishlist
    const getRes = await fetch(`${baseUrl}/api/auth/wishlist`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const getData = await getRes.json();
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getData.wishlist.length, 1);
    assert.strictEqual(getData.wishlist[0].title, 'Kyoto Cultural Sanctuary');

    // Remove item
    const delRes = await fetch(`${baseUrl}/api/auth/wishlist/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const delData = await delRes.json();
    assert.strictEqual(delRes.status, 200);
    assert.strictEqual(delData.success, true);
  });

  test('4. Admin & Analytics Dashboard - Regular user should be forbidden (403)', async () => {
    const res = await fetch(`${baseUrl}/api/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert.strictEqual(res.status, 403);
  });

  test('5. Admin & Analytics Dashboard - Admin should access platform statistics & users list', async () => {
    const statsRes = await fetch(`${baseUrl}/api/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();

    assert.strictEqual(statsRes.status, 200);
    assert.strictEqual(statsData.success, true);
    assert.ok(statsData.stats.totalUsers >= 2);

    const usersRes = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const usersData = await usersRes.json();

    assert.strictEqual(usersRes.status, 200);
    assert.strictEqual(usersData.success, true);
    assert.ok(usersData.users.length >= 2);
  });
});
