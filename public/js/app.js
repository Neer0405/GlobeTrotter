/**
 * GlobeTrotter Frontend Application Architecture
 * Interacts with Node.js/Express + SQLite API on http://localhost:5000/api/auth
 */

const API_BASE = '/api/auth';

// Curated Global Destinations Database
const DESTINATIONS = [
  {
    id: 1,
    title: 'Kyoto Cultural Sanctuary',
    location: 'Kyoto, Japan',
    region: 'Asia',
    category: 'Culture',
    vibe: 'Culture',
    price: 1450,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    description: 'Immerse yourself in ancient temples, bamboo groves, traditional tea houses, and tranquil zen gardens in Japan’s historic heart.',
    highlights: [
      'Day 1: Fushimi Inari Shrine & Gion Geisha District Walk',
      'Day 2: Arashiyama Bamboo Grove & Tenryu-ji Temple',
      'Day 3: Kinkaku-ji (Golden Pavilion) & Traditional Tea Ceremony'
    ]
  },
  {
    id: 2,
    title: 'Santorini Cliffside Luxury',
    location: 'Santorini, Greece',
    region: 'Europe',
    category: 'Popular',
    vibe: 'Luxury',
    price: 2100,
    rating: 4.95,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
    description: 'Iconic whitewashed villas overlooking blue caldera waters, world-famous sunsets in Oia, and volcanic beach retreats.',
    highlights: [
      'Day 1: Arrival in Fira & Cliffside Dinner in Oia',
      'Day 2: Luxury Catamaran Cruise around Red & White Beaches',
      'Day 3: Wine Tasting at Volcanic Vineyards'
    ]
  },
  {
    id: 3,
    title: 'Banff Alpine Explorer',
    location: 'Banff National Park, Canada',
    region: 'Americas',
    category: 'Alpine',
    vibe: 'Alpine',
    price: 1200,
    rating: 4.88,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    description: 'Turquoise glacial lakes, snow-capped Canadian Rockies, wilderness hiking, and mountain hot springs.',
    highlights: [
      'Day 1: Sunrise at Lake Louise & Canoe Excursion',
      'Day 2: Icefields Parkway Drive & Glacier Skywalk',
      'Day 3: Banff Upper Hot Springs & Gondola Ride'
    ]
  },
  {
    id: 4,
    title: 'Bali Island Paradise',
    location: 'Ubud & Seminyak, Indonesia',
    region: 'Asia',
    category: 'Tropical',
    vibe: 'Tropical',
    price: 950,
    rating: 4.85,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    description: 'Lush jungle rice terraces, spiritual wellness retreats, vibrant beach clubs, and serene cliffside temples.',
    highlights: [
      'Day 1: Tegallalang Rice Terraces & Sacred Monkey Sanctuary',
      'Day 2: Sunrise Trek to Mount Batur Volcano',
      'Day 3: Seminyak Sunset Beach Club & Spa Session'
    ]
  },
  {
    id: 5,
    title: 'Amalfi Coast Grand Tour',
    location: 'Positano & Capri, Italy',
    region: 'Europe',
    category: 'Popular',
    vibe: 'Luxury',
    price: 2400,
    rating: 4.92,
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    description: 'Dramatic coastal cliffs, lemon orchards, pastel houses cascading into azure waters, and authentic Italian gastronomy.',
    highlights: [
      'Day 1: Positano Village Exploration & Cliffside Lunch',
      'Day 2: Private Boat Excursion to Capri & Blue Grotto',
      'Day 3: Path of the Gods Panoramic Coastal Hike'
    ]
  },
  {
    id: 6,
    title: 'Swiss Alps Railway Escape',
    location: 'Zermatt, Switzerland',
    region: 'Europe',
    category: 'Alpine',
    vibe: 'Alpine',
    price: 2800,
    rating: 4.96,
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    description: 'Glacier skiing under the iconic Matterhorn, scenic train journeys on the Glacier Express, and cozy alpine chalets.',
    highlights: [
      'Day 1: Gornergrat Bahn Cogwheel Railway & Matterhorn View',
      'Day 2: Alpine Skiing / Hiking & Cheese Fondue Evening',
      'Day 3: Glacier Palace Spa & Panoramic Cable Car'
    ]
  },
  {
    id: 7,
    title: 'Cairo & Nile Pharaohs Heritage',
    location: 'Giza & Luxor, Egypt',
    region: 'Africa',
    category: 'Culture',
    vibe: 'Culture',
    price: 1100,
    rating: 4.82,
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80',
    description: 'Marvel at the Ancient Pyramids of Giza, explore King Tut’s tomb, and cruise down the historic Nile River.',
    highlights: [
      'Day 1: Great Pyramids of Giza & Sphinx Private Tour',
      'Day 2: Grand Egyptian Museum & Khan el-Khalili Bazaar',
      'Day 3: Luxor Temple & Valley of the Kings Sunset Cruise'
    ]
  },
  {
    id: 8,
    title: 'Costa Rica Rainforest Eco-Lodge',
    location: 'Arenal & Manuel Antonio, Costa Rica',
    region: 'Americas',
    category: 'Budget',
    vibe: 'Tropical',
    price: 880,
    rating: 4.87,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    description: 'Zip-line through rainforest canopies, soak in volcanic hot springs, and spot sloths and toucans on coastal nature trails.',
    highlights: [
      'Day 1: Arenal Volcano National Park Hike & Hot Springs',
      'Day 2: Rainforest Canopy Zipline & Hanging Bridges Walk',
      'Day 3: Manuel Antonio Beach & Wildlife Reserve Tour'
    ]
  }
];

// App State
const state = {
  user: null,
  token: localStorage.getItem('globetrotter_token') || null,
  destinations: [...DESTINATIONS],
  bookmarks: JSON.parse(localStorage.getItem('globetrotter_bookmarks') || '[]'),
  currentQuizStep: 0,
  quizAnswers: {},
  itineraryActivities: [
    { day: 1, name: 'Arrival & Welcome Dinner', category: 'Food', cost: 120 },
    { day: 1, name: 'Historic City Center Walking Tour', category: 'Tours', cost: 45 },
    { day: 2, name: 'Private Boat Excursion', category: 'Tours', cost: 215 },
    { day: 3, name: 'Panoramic Viewpoint & Spa', category: 'Activities', cost: 150 }
  ]
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initAuth();
  initDashboard();
  initMyTrips();
  initTripWizard();
  initCityExplorer();
  initActivityDiscovery();
  initBudgetAnalytics();
  initPublicShareScreen();
  initItineraryMultiView();
  initExplorer();
  initQuiz();
  initItinerary();
  checkHealthAndSession();
});

/* API Helper */
async function apiRequest(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (err) {
    console.error(`API Error (${endpoint}):`, err);
    throw err;
  }
}

/* Check Backend Server & User Session */
async function checkHealthAndSession() {
  const statusEl = document.getElementById('api-status-text');
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      statusEl.textContent = 'API Online';
    } else {
      statusEl.textContent = 'API Offline';
    }
  } catch {
    statusEl.textContent = 'Disconnected';
  }

  if (state.token) {
    try {
      const data = await apiRequest('/me');
      if (data.success && data.user) {
        setLoggedInUser(data.user);
      }
    } catch {
      // Token invalid or expired
      logoutUser();
    }
  }
}

/* UI Navigation & Tabs */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-target');
      switchTab(targetId);
    });
  });

  // User avatar menu click -> open profile tab
  document.getElementById('user-profile-trigger').addEventListener('click', () => {
    switchTab('profile-section');
  });
}

function switchTab(targetId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

  const activeSection = document.getElementById(targetId);
  if (activeSection) {
    activeSection.classList.remove('hidden');
  }

  const activeLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

/* Auth System (Login, Register, Logout, Profile) */
function initAuth() {
  // Modal toggle triggers
  document.getElementById('open-login-btn').addEventListener('click', () => openModal('login-modal'));
  document.getElementById('open-register-btn').addEventListener('click', () => openModal('register-modal'));
  document.getElementById('switch-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal('login-modal');
    openModal('register-modal');
  });
  document.getElementById('switch-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal('register-modal');
    openModal('login-modal');
  });
  document.getElementById('forgot-password-link').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal('login-modal');
    openModal('forgot-modal');
  });

  // Modal Close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    });
  });

  // Form Submissions
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const data = await apiRequest('/login', 'POST', { email, password });
      state.token = data.token;
      localStorage.setItem('globetrotter_token', data.token);
      setLoggedInUser(data.user);
      closeModal('login-modal');
      showToast(`Welcome back, ${data.user.name}! 🚀`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const bio = document.getElementById('reg-bio').value;

    try {
      const data = await apiRequest('/register', 'POST', { name, email, password, bio });
      state.token = data.token;
      localStorage.setItem('globetrotter_token', data.token);
      setLoggedInUser(data.user);
      closeModal('register-modal');
      showToast(`Account created! Welcome to GlobeTrotter, ${data.user.name}! 🎉`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    logoutUser();
    showToast('Signed out successfully.', 'success');
  });

  // Profile Update Form
  document.getElementById('profile-update-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('update-name-input').value;
    const bio = document.getElementById('update-bio-input').value;
    const currency = document.getElementById('update-currency-input').value;
    const language = document.getElementById('update-language-input').value;

    try {
      const data = await apiRequest('/profile', 'PUT', { name, bio, currency, language });
      setLoggedInUser(data.user);
      showToast('Settings & preferences saved successfully! 💾', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Change Password Form
  document.getElementById('change-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('current-pass-input').value;
    const newPassword = document.getElementById('new-pass-input').value;

    try {
      await apiRequest('/change-password', 'POST', { currentPassword, newPassword });
      e.target.reset();
      showToast('Password updated successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Forgot Password Form
  document.getElementById('forgot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;

    try {
      const data = await apiRequest('/forgot-password', 'POST', { email });
      document.getElementById('reset-token-code').textContent = data.resetToken;
      document.getElementById('reset-token-display').classList.remove('hidden');
      showToast('Reset token generated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('use-reset-token-btn').addEventListener('click', () => {
    const token = document.getElementById('reset-token-code').textContent;
    document.getElementById('reset-token-input').value = token;
    closeModal('forgot-modal');
    openModal('reset-modal');
  });

  // Reset Password Form
  document.getElementById('reset-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = document.getElementById('reset-token-input').value;
    const newPassword = document.getElementById('reset-new-password').value;

    try {
      await apiRequest('/reset-password', 'POST', { token, newPassword });
      closeModal('reset-modal');
      showToast('Password reset complete! You can now log in.', 'success');
      openModal('login-modal');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

function setLoggedInUser(user) {
  state.user = user;

  document.getElementById('guest-nav-actions').style.display = 'none';
  document.getElementById('user-nav-actions').style.display = 'flex';
  document.getElementById('nav-profile-link').style.display = 'block';
  document.getElementById('nav-mytrips-link').style.display = 'block';
  document.getElementById('nav-budget-link').style.display = 'block';

  const adminLink = document.getElementById('nav-admin-link');
  if (user.role === 'admin') {
    adminLink.style.display = 'block';
  } else {
    adminLink.style.display = 'none';
  }

  const initials = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  document.getElementById('user-avatar-initials').textContent = initials;
  document.getElementById('profile-avatar-large').textContent = initials;
  document.getElementById('user-nav-name').textContent = user.name.split(' ')[0];

  document.getElementById('profile-name-display').textContent = user.name;
  document.getElementById('profile-email-display').textContent = user.email;
  document.getElementById('profile-bio-display').textContent = user.bio || 'No bio specified.';
  document.getElementById('profile-role-badge').textContent = user.role === 'admin' ? '⚡ Administrator' : '🌍 GlobeTrotter Explorer';

  const curr = user.currency || 'USD';
  const lang = user.language || 'en';
  document.getElementById('pref-currency-pill').textContent = `💵 ${curr}`;
  document.getElementById('pref-language-pill').textContent = `🌐 ${lang.toUpperCase()}`;

  document.getElementById('update-name-input').value = user.name || '';
  document.getElementById('update-bio-input').value = user.bio || '';
  document.getElementById('update-currency-input').value = curr;
  document.getElementById('update-language-input').value = lang;

  // Load user dashboard stats, recent trips, budget trips, wishlist, and admin stats if admin
  loadDashboardData();
  loadMyTrips();
  loadBudgetAnalyticsTrips();
  loadWishlist();
  if (user.role === 'admin') {
    loadAdminDashboard();
  }
}

function logoutUser() {
  state.user = null;
  state.token = null;
  localStorage.removeItem('globetrotter_token');

  document.getElementById('guest-nav-actions').style.display = 'flex';
  document.getElementById('user-nav-actions').style.display = 'none';
  document.getElementById('nav-profile-link').style.display = 'none';
  document.getElementById('nav-mytrips-link').style.display = 'none';
  document.getElementById('nav-budget-link').style.display = 'none';
  document.getElementById('nav-admin-link').style.display = 'none';

  document.getElementById('dash-welcome-heading').textContent = 'Welcome to GlobeTrotter! ✨';
  document.getElementById('dash-stat-trips').textContent = '0 Trips';
  document.getElementById('dash-stat-budget').textContent = '$0';
  document.getElementById('dash-stat-upcoming').textContent = '0 Upcoming';
  document.getElementById('recent-trips-grid').innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-glass);">
      <p style="font-size: 2rem; margin-bottom: 0.5rem;">✈️</p>
      <h3>Sign in to view your saved trips</h3>
      <p style="color: var(--text-muted); margin-top: 0.25rem;">Create an account to start planning custom trips and tracking budgets.</p>
    </div>
  `;

  if (!document.getElementById('profile-section').classList.contains('hidden') || !document.getElementById('admin-section').classList.contains('hidden')) {
    switchTab('dashboard-section');
  }
}

/* Dashboard / Home Screen Functions */
function initDashboard() {
  loadRecommendations();

  // Quick Plan Trip button
  document.getElementById('dash-quick-plan-btn').addEventListener('click', () => {
    if (!state.user) {
      showToast('Please sign in to plan and save new trips!', 'error');
      openModal('login-modal');
      return;
    }
    openModal('plan-trip-modal');
  });

  // Create Trip Form submit
  document.getElementById('plan-trip-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const destination_title = document.getElementById('trip-dest-title').value;
    const destination_location = document.getElementById('trip-dest-location').value;
    const start_date = document.getElementById('trip-start-date').value;
    const end_date = document.getElementById('trip-end-date').value;
    const total_budget = parseFloat(document.getElementById('trip-total-budget').value) || 0;

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({
          destination_title,
          destination_location,
          start_date,
          end_date,
          total_budget,
          status: 'upcoming'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create trip');

      closeModal('plan-trip-modal');
      e.target.reset();
      showToast(`Trip plan for "${destination_title}" created! ✈️`, 'success');
      loadDashboardSummary();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function loadDashboardData() {
  loadRecommendations();
  if (state.token) {
    loadDashboardSummary();
  }
}

async function loadDashboardSummary() {
  if (!state.token) return;

  try {
    const res = await fetch('/api/dashboard/summary', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById('dash-welcome-heading').textContent = data.welcomeMessage;
      document.getElementById('dash-stat-trips').textContent = `${data.quickStats.totalTrips} Trips`;
      document.getElementById('dash-stat-budget').textContent = `$${data.quickStats.totalBudgetSpent.toLocaleString()}`;
      document.getElementById('dash-stat-upcoming').textContent = `${data.quickStats.upcomingTripsCount} Upcoming`;

      renderRecentTrips(data.recentTrips);
    }
  } catch (err) {
    console.error('Error loading dashboard summary:', err);
  }
}

async function loadRecommendations() {
  try {
    const res = await fetch('/api/dashboard/recommendations');
    const data = await res.json();

    if (data.success && data.recommendations) {
      const grid = document.getElementById('recommended-destinations-grid');
      grid.innerHTML = data.recommendations.map(dest => `
        <div class="dest-card">
          <div class="dest-img-wrap">
            <img src="${dest.image_url}" alt="${dest.title}" class="dest-img" loading="lazy">
            <span class="dest-badge">⭐ ${dest.rating} • ${dest.region}</span>
          </div>
          <div class="dest-body">
            <div class="dest-location">📍 ${dest.location}</div>
            <h3 class="dest-title">${dest.title}</h3>
            <p class="dest-desc">${dest.description}</p>
            
            <div style="margin-bottom: 1rem;">
              <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 600;">Popular Highlights:</span>
              <div style="display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.35rem;">
                ${dest.activities.slice(0, 2).map(act => `
                  <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; justify-content: space-between;">
                    <span>🔹 ${act.title}</span>
                    <strong style="color: var(--primary-cyan);">$${act.estimated_cost}</strong>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="dest-footer">
              <div class="price-tag">$${dest.price.toLocaleString()} <span>/ est. budget</span></div>
              <button class="btn btn-primary btn-sm" onclick="addDestinationToItinerary('${dest.title}')">Plan Trip →</button>
            </div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading recommendations:', err);
  }
}

function renderRecentTrips(trips) {
  const grid = document.getElementById('recent-trips-grid');
  if (!trips || trips.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-glass);">
        <p style="font-size: 2rem; margin-bottom: 0.5rem;">✈️</p>
        <h3>No Trips Planned Yet</h3>
        <p style="color: var(--text-muted); margin-top: 0.25rem;">Click "Plan New Trip" above to launch your first travel plan!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = trips.map(trip => `
    <div class="dest-card">
      <div class="dest-img-wrap">
        <img src="${trip.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828'}" alt="${trip.destination_title}" class="dest-img" loading="lazy">
        <span class="dest-badge" style="background: ${trip.status === 'upcoming' ? 'rgba(0, 245, 212, 0.2)' : 'rgba(255, 190, 11, 0.2)'}; color: ${trip.status === 'upcoming' ? 'var(--primary-cyan)' : 'var(--accent-gold)'};">
          ${trip.status.toUpperCase()}
        </span>
      </div>
      <div class="dest-body">
        <div class="dest-location">📍 ${trip.destination_location}</div>
        <h3 class="dest-title">${trip.destination_title}</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          🗓️ ${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}
        </p>

        <div class="dest-footer">
          <div class="price-tag">$${trip.total_budget.toLocaleString()} <span>/ total budget</span></div>
          <button class="btn btn-glass btn-sm" onclick="addDestinationToItinerary('${trip.destination_title}')">View Details</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* Destination Explorer Render & Filter */
function initExplorer() {
  renderDestinations(state.destinations);

  document.getElementById('search-btn').addEventListener('click', filterDestinations);
  document.getElementById('search-query').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') filterDestinations();
  });

  document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      filterDestinations();
    });
  });
}

function filterDestinations() {
  const query = document.getElementById('search-query').value.toLowerCase().trim();
  const region = document.getElementById('filter-region').value;
  const vibe = document.getElementById('filter-vibe').value;
  const activeCategoryTag = document.querySelector('.filter-tag.active').getAttribute('data-category');

  const filtered = state.destinations.filter(d => {
    const matchesQuery = d.title.toLowerCase().includes(query) || d.location.toLowerCase().includes(query) || d.description.toLowerCase().includes(query);
    const matchesRegion = region === 'all' || d.region === region;
    const matchesVibe = vibe === 'all' || d.vibe === vibe;
    const matchesTag = activeCategoryTag === 'all' || d.category === activeCategoryTag;

    return matchesQuery && matchesRegion && matchesVibe && matchesTag;
  });

  renderDestinations(filtered);
}

function renderDestinations(items) {
  const grid = document.getElementById('destinations-grid');
  document.getElementById('destination-count').textContent = items.length;

  if (items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
        <p style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</p>
        <h3>No Destinations Found</h3>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">Try adjusting your search criteria or filter tags.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(dest => {
    const isBookmarked = state.bookmarks.includes(dest.id);
    return `
      <div class="dest-card">
        <div class="dest-img-wrap">
          <img src="${dest.image}" alt="${dest.title}" class="dest-img" loading="lazy">
          <span class="dest-badge">${dest.category}</span>
          <button class="bookmark-btn ${isBookmarked ? 'saved' : ''}" onclick="toggleBookmark(${dest.id})" title="Save to Bookmarks">
            ${isBookmarked ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="dest-body">
          <div class="dest-location">📍 ${dest.location}</div>
          <h3 class="dest-title">${dest.title}</h3>
          <p class="dest-desc">${dest.description}</p>

          <div class="dest-footer">
            <div class="price-tag">$${dest.price.toLocaleString()} <span>/ person</span></div>
            <button class="btn btn-glass btn-sm" onclick="openDestinationDetail(${dest.id})">Details →</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.toggleBookmark = function(destId) {
  const idx = state.bookmarks.indexOf(destId);
  if (idx > -1) {
    state.bookmarks.splice(idx, 1);
    showToast('Removed from saved destinations.', 'success');
  } else {
    state.bookmarks.push(destId);
    showToast('Saved to your trip bookmarks! ❤️', 'success');
  }
  localStorage.setItem('globetrotter_bookmarks', JSON.stringify(state.bookmarks));
  filterDestinations();
};

window.openDestinationDetail = function(destId) {
  const dest = state.destinations.find(d => d.id === destId);
  if (!dest) return;

  const content = document.getElementById('dest-modal-content');
  content.innerHTML = `
    <div style="height: 240px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 1.25rem;">
      <img src="${dest.image}" alt="${dest.title}" style="width: 100%; height: 100%; object-fit: cover;">
    </div>
    <span class="dest-badge">${dest.region} • ${dest.category}</span>
    <h2 style="font-size: 1.8rem; margin: 0.5rem 0;">${dest.title}</h2>
    <p style="color: var(--accent-gold); font-weight: 600; margin-bottom: 1rem;">⭐ ${dest.rating} Rating • Est. Cost: $${dest.price.toLocaleString()}</p>
    <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 1.5rem;">${dest.description}</p>
    
    <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem;">📅 Sample Itinerary Highlights:</h3>
    <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;">
      ${dest.highlights.map(h => `
        <div style="background: rgba(7,10,19,0.5); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-glass); font-size: 0.9rem;">
          ✨ ${h}
        </div>
      `).join('')}
    </div>

    <div style="display: flex; gap: 1rem;">
      <button class="btn btn-accent" style="flex: 1;" onclick="addDestinationToItinerary('${dest.title}')">✈️ Plan Trip Here</button>
      <button class="btn btn-glass" onclick="closeModal('dest-detail-modal')">Close</button>
    </div>
  `;

  openModal('dest-detail-modal');
};

window.addDestinationToItinerary = function(title) {
  document.getElementById('trip-title').textContent = `✈️ ${title} Adventure`;
  closeModal('dest-detail-modal');
  switchTab('itinerary-section');
  showToast(`Loaded ${title} into Itinerary Planner!`, 'success');
};

/* AI Trip Matcher Quiz */
const QUIZ_QUESTIONS = [
  {
    title: "Step 1: What type of environment calls to you?",
    subtitle: "Select your dream vibe for your upcoming trip.",
    key: "vibe",
    options: [
      { label: "⛩️ Cultural & Historic", value: "Culture", icon: "⛩️" },
      { label: "🏝️ Tropical Beach", value: "Tropical", icon: "🏝️" },
      { label: "🏔️ Alpine & Nature", value: "Alpine", icon: "🏔️" },
      { label: "✨ High-End Luxury", value: "Luxury", icon: "✨" }
    ]
  },
  {
    title: "Step 2: What is your target budget style?",
    subtitle: "Help us match luxury resorts or budget travel spots.",
    key: "budget",
    options: [
      { label: "💰 Value Explorer ($800-$1200)", value: "budget", icon: "💰" },
      { label: "⚖️ Balanced Comfort ($1200-$2000)", value: "mid", icon: "⚖️" },
      { label: "💎 Premium Luxury ($2000+)", value: "high", icon: "💎" }
    ]
  },
  {
    title: "Step 3: How long will your trip be?",
    subtitle: "Find trips matching your vacation duration.",
    key: "duration",
    options: [
      { label: "⚡ Weekend Getaway (3 Days)", value: "short", icon: "⚡" },
      { label: "🗓️ Full Week (7 Days)", value: "week", icon: "🗓️" },
      { label: "✈️ Extended Vacation (2+ Weeks)", value: "long", icon: "✈️" }
    ]
  }
];

function initQuiz() {
  renderQuizStep();

  document.getElementById('quiz-next-btn').addEventListener('click', () => {
    if (state.currentQuizStep < QUIZ_QUESTIONS.length - 1) {
      state.currentQuizStep++;
      renderQuizStep();
    } else {
      finishQuiz();
    }
  });

  document.getElementById('quiz-prev-btn').addEventListener('click', () => {
    if (state.currentQuizStep > 0) {
      state.currentQuizStep--;
      renderQuizStep();
    }
  });
}

function renderQuizStep() {
  const question = QUIZ_QUESTIONS[state.currentQuizStep];
  document.getElementById('quiz-question-title').textContent = question.title;
  document.getElementById('quiz-question-sub').textContent = question.subtitle;
  document.getElementById('quiz-prev-btn').style.display = state.currentQuizStep === 0 ? 'none' : 'inline-flex';

  const nextBtn = document.getElementById('quiz-next-btn');
  nextBtn.textContent = state.currentQuizStep === QUIZ_QUESTIONS.length - 1 ? '🎯 See My Matches' : 'Next Step →';

  const container = document.getElementById('quiz-options-container');
  container.innerHTML = question.options.map(opt => {
    const isSelected = state.quizAnswers[question.key] === opt.value;
    return `
      <div class="quiz-option ${isSelected ? 'selected' : ''}" onclick="selectQuizOption('${question.key}', '${opt.value}')">
        <div class="icon">${opt.icon}</div>
        <strong style="display: block; font-size: 1.05rem; margin-top: 0.35rem;">${opt.label}</strong>
      </div>
    `;
  }).join('');
}

window.selectQuizOption = function(key, val) {
  state.quizAnswers[key] = val;
  renderQuizStep();
};

function finishQuiz() {
  const chosenVibe = state.quizAnswers.vibe || 'Culture';
  const matches = state.destinations.filter(d => d.vibe === chosenVibe);
  
  const resultsContainer = document.getElementById('quiz-results-container');
  const resultsGrid = document.getElementById('quiz-results-grid');

  resultsContainer.classList.remove('hidden');
  resultsGrid.innerHTML = matches.map(dest => `
    <div class="dest-card">
      <div class="dest-img-wrap">
        <img src="${dest.image}" class="dest-img" alt="${dest.title}">
        <span class="dest-badge">🔥 98% Match</span>
      </div>
      <div class="dest-body">
        <h3 class="dest-title">${dest.title}</h3>
        <p class="dest-desc">${dest.description}</p>
        <button class="btn btn-accent btn-sm" onclick="openDestinationDetail(${dest.id})" style="margin-top: 1rem;">View Matched Plan</button>
      </div>
    </div>
  `).join('');

  resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

/* Itinerary Planner */
function initItinerary() {
  renderItineraryTimeline();

  document.getElementById('add-activity-btn').addEventListener('click', () => {
    const name = prompt('Activity Name:', 'Explore Local Market');
    const cost = parseInt(prompt('Estimated Cost ($):', '50')) || 0;
    if (name) {
      state.itineraryActivities.push({ day: 2, name, category: 'Activities', cost });
      renderItineraryTimeline();
      showToast('Activity added to itinerary!', 'success');
    }
  });

  document.getElementById('save-itinerary-btn').addEventListener('click', () => {
    if (!state.user) {
      showToast('Please sign in to save your itinerary to your account!', 'error');
      openModal('login-modal');
      return;
    }
    showToast('Itinerary saved to your GlobeTrotter account!', 'success');
  });
}

function renderItineraryTimeline() {
  const list = document.getElementById('timeline-list');
  list.innerHTML = state.itineraryActivities.map((act, i) => `
    <div class="timeline-item">
      <div class="timeline-node">D${act.day}</div>
      <div class="timeline-content">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 1.05rem;">${act.name}</strong>
          <span style="color: var(--primary-cyan); font-weight: 700;">$${act.cost}</span>
        </div>
        <span style="font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase;">Category: ${act.category}</span>
      </div>
    </div>
  `).join('');

  // Calculate live total budget
  const activitiesTotal = state.itineraryActivities.reduce((acc, a) => acc + a.cost, 0);
  const hotelCost = 840;
  const transportCost = 650;
  const total = hotelCost + transportCost + activitiesTotal;

  document.getElementById('cost-tours').textContent = `$${activitiesTotal}`;
  document.getElementById('cost-total').textContent = `$${total.toLocaleString()}`;
}

/* Modal Helpers */
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

/* Toast System */
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '⚠️'}</span>
    <div>${msg}</div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* My Trips (Trip List Screen) Functions */
function initMyTrips() {
  document.getElementById('open-trip-wizard-btn').addEventListener('click', () => {
    if (!state.user) {
      showToast('Please sign in to launch the trip wizard!', 'error');
      openModal('login-modal');
      return;
    }
    openModal('wizard-modal');
  });

  // Search input listener
  document.getElementById('mytrips-search-input').addEventListener('input', () => {
    loadMyTrips();
  });

  // Status Filter tags listener
  document.querySelectorAll('#mytrips-status-tags .filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.querySelectorAll('#mytrips-status-tags .filter-tag').forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      loadMyTrips();
    });
  });

  // Edit form submit handler
  document.getElementById('edit-trip-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-trip-id').value;
    const trip_name = document.getElementById('edit-trip-name').value;
    const destination_location = document.getElementById('edit-trip-location').value;
    const start_date = document.getElementById('edit-start-date').value;
    const end_date = document.getElementById('edit-end-date').value;
    const total_budget = parseFloat(document.getElementById('edit-trip-budget').value) || 0;
    const stop_count = parseInt(document.getElementById('edit-trip-stops').value, 10) || 1;
    const status = document.getElementById('edit-trip-status').value;
    const cover_photo_url = document.getElementById('edit-trip-photo').value;

    try {
      const res = await fetch(`/api/trips/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({
          trip_name,
          destination_location,
          start_date,
          end_date,
          total_budget,
          stop_count,
          status,
          cover_photo_url
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update trip');

      closeModal('edit-trip-modal');
      showToast('Trip plan updated successfully! 📝', 'success');
      loadMyTrips();
      loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Copy share URL button handler
  document.getElementById('copy-share-url-btn').addEventListener('click', () => {
    const input = document.getElementById('share-link-input');
    input.select();
    navigator.clipboard.writeText(input.value);
    showToast('Shareable link copied to clipboard! 📋', 'success');
  });
}

async function loadMyTrips() {
  if (!state.token) return;

  const search = document.getElementById('mytrips-search-input').value.trim();
  const activeStatusTag = document.querySelector('#mytrips-status-tags .filter-tag.active');
  const status = activeStatusTag ? activeStatusTag.getAttribute('data-status') : 'all';

  let url = `/api/trips?status=${encodeURIComponent(status)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();

    if (data.success) {
      renderMyTripsGrid(data.trips);
    }
  } catch (err) {
    console.error('Error loading my trips:', err);
  }
}

function renderMyTripsGrid(trips) {
  const grid = document.getElementById('mytrips-grid');

  if (!trips || trips.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-glass);">
        <p style="font-size: 2.5rem; margin-bottom: 0.5rem;">✈️</p>
        <h3>No Trips Found</h3>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">Try adjusting your search query or create a new trip using the Wizard!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = trips.map(trip => {
    const title = trip.trip_name || trip.destination_title;
    const cover = trip.cover_photo_url || trip.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';
    const statusUpper = (trip.status || 'upcoming').toUpperCase();
    const stops = trip.stop_count || 1;

    return `
      <div class="dest-card">
        <div class="dest-img-wrap">
          <img src="${cover}" alt="${title}" class="dest-img" loading="lazy">
          <span class="dest-badge" style="background: ${statusUpper === 'UPCOMING' ? 'rgba(0, 245, 212, 0.2)' : statusUpper === 'ONGOING' ? 'rgba(255, 190, 11, 0.2)' : 'rgba(114, 9, 183, 0.2)'}; color: ${statusUpper === 'UPCOMING' ? 'var(--primary-cyan)' : statusUpper === 'ONGOING' ? 'var(--accent-gold)' : '#c084fc'};">
            ${statusUpper}
          </span>
        </div>
        <div class="dest-body">
          <div class="dest-location">📍 ${trip.destination_location} • ${stops} ${stops === 1 ? 'Stop' : 'Stops'}</div>
          <h3 class="dest-title">${title}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            🗓️ ${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}
          </p>
          ${trip.description ? `<p class="dest-desc" style="-webkit-line-clamp: 2; margin-bottom: 1rem;">${trip.description}</p>` : ''}

          <div style="font-size: 1.15rem; font-weight: 800; color: var(--primary-cyan); margin-bottom: 1rem;">
            $${trip.total_budget ? trip.total_budget.toLocaleString() : '0'} <span style="font-size: 0.75rem; color: var(--text-dim); font-weight: 400;">est. budget</span>
          </div>

          <div class="dest-footer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; border-top: 1px solid var(--border-glass); padding-top: 0.85rem;">
            <button class="btn btn-glass btn-sm" onclick="openEditTrip(${trip.id})">✏️ Edit</button>
            <button class="btn btn-glass btn-sm" onclick="openShareTrip('${trip.share_code || ''}')">🔗 Share</button>
            <button class="btn btn-primary btn-sm" onclick="addDestinationToItinerary('${title}')">👁️ View</button>
            <button class="btn btn-sm" style="background: rgba(255,0,110,0.15); color: var(--accent-pink); border: 1px solid rgba(255,0,110,0.3);" onclick="deleteUserTrip(${trip.id})">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.openEditTrip = async function(id) {
  try {
    const res = await fetch(`/api/trips/${id}`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const t = data.trip;
    document.getElementById('edit-trip-id').value = t.id;
    document.getElementById('edit-trip-name').value = t.trip_name || t.destination_title;
    document.getElementById('edit-trip-location').value = t.destination_location;
    document.getElementById('edit-start-date').value = t.start_date;
    document.getElementById('edit-end-date').value = t.end_date;
    document.getElementById('edit-trip-budget').value = t.total_budget || 0;
    document.getElementById('edit-trip-stops').value = t.stop_count || 1;
    document.getElementById('edit-trip-status').value = t.status || 'upcoming';
    document.getElementById('edit-trip-photo').value = t.cover_photo_url || t.image_url || '';

    openModal('edit-trip-modal');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.openShareTrip = function(shareCode) {
  if (!shareCode) {
    showToast('Share code not available for this trip.', 'error');
    return;
  }
  const fullUrl = `${window.location.origin}/api/trips/share/${shareCode}`;
  document.getElementById('share-link-input').value = fullUrl;
  openModal('share-trip-modal');
};

window.deleteUserTrip = async function(id) {
  if (!confirm('Are you sure you want to delete this trip plan?')) return;

  try {
    const res = await fetch(`/api/trips/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast('Trip plan deleted.', 'success');
    loadMyTrips();
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

/* Interactive Create Trip Wizard */
let currentWizStep = 1;
let selectedPresetPhotoUrl = '';

function initTripWizard() {
  loadPresetCoverPhotos();

  const stepTitles = [
    { title: 'Step 1: Trip Basics', sub: 'Set your trip title, location, and description.' },
    { title: 'Step 2: Schedule & Budget', sub: 'Set start & end dates, estimated budget, and number of stops.' },
    { title: 'Step 3: Cover Photo Picker', sub: 'Choose a preset photo or enter a custom image URL.' }
  ];

  const nextBtn = document.getElementById('wiz-next-btn');
  const backBtn = document.getElementById('wiz-back-btn');

  nextBtn.addEventListener('click', () => {
    if (currentWizStep === 1) {
      const name = document.getElementById('wiz-trip-name').value;
      const loc = document.getElementById('wiz-location').value;
      if (!name || !loc) {
        showToast('Please enter both Trip Name and Location.', 'error');
        return;
      }
      setWizardStep(2);
    } else if (currentWizStep === 2) {
      const start = document.getElementById('wiz-start-date').value;
      const end = document.getElementById('wiz-end-date').value;
      if (!start || !end) {
        showToast('Please set both Start Date and End Date.', 'error');
        return;
      }
      setWizardStep(3);
    } else if (currentWizStep === 3) {
      submitWizardForm();
    }
  });

  backBtn.addEventListener('click', () => {
    if (currentWizStep > 1) {
      setWizardStep(currentWizStep - 1);
    }
  });

  function setWizardStep(step) {
    currentWizStep = step;
    document.querySelectorAll('.wizard-step-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById(`wizard-step-${step}`).classList.remove('hidden');

    document.getElementById('wizard-step-title').textContent = stepTitles[step - 1].title;
    document.getElementById('wizard-step-sub').textContent = stepTitles[step - 1].sub;
    document.getElementById('wizard-step-pill').textContent = `Step ${step} of 3`;
    document.getElementById('wizard-progress-bar').style.width = `${step * 33.3}%`;

    backBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
    nextBtn.textContent = step === 3 ? '🚀 Create Trip Plan' : 'Next Step →';
  }
}

async function loadPresetCoverPhotos() {
  try {
    const res = await fetch('/api/trips/presets/photos');
    const data = await res.json();

    if (data.success && data.presetPhotos) {
      selectedPresetPhotoUrl = data.presetPhotos[0].url;
      const grid = document.getElementById('wizard-preset-grid');

      grid.innerHTML = data.presetPhotos.map((photo, i) => `
        <div class="preset-photo-card ${i === 0 ? 'selected' : ''}" onclick="selectPresetPhoto(this, '${photo.url}')" style="height: 70px; border-radius: var(--radius-sm); overflow: hidden; cursor: pointer; border: 2px solid ${i === 0 ? 'var(--primary-cyan)' : 'transparent'}; position: relative;">
          <img src="${photo.url}" alt="${photo.title}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading preset photos:', err);
  }
}

window.selectPresetPhoto = function(el, url) {
  document.querySelectorAll('.preset-photo-card').forEach(c => c.style.borderColor = 'transparent');
  el.style.borderColor = 'var(--primary-cyan)';
  selectedPresetPhotoUrl = url;
};

async function submitWizardForm() {
  const trip_name = document.getElementById('wiz-trip-name').value;
  const destination_location = document.getElementById('wiz-location').value;
  const description = document.getElementById('wiz-description').value;
  const start_date = document.getElementById('wiz-start-date').value;
  const end_date = document.getElementById('wiz-end-date').value;
  const total_budget = parseFloat(document.getElementById('wiz-budget').value) || 0;
  const stop_count = parseInt(document.getElementById('wiz-stops').value, 10) || 1;
  const status = document.getElementById('wiz-status').value;
  const customUrl = document.getElementById('wiz-custom-photo-url').value;

  const cover_photo_url = customUrl || selectedPresetPhotoUrl;

  try {
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({
        trip_name,
        destination_location,
        description,
        start_date,
        end_date,
        total_budget,
        stop_count,
        status,
        cover_photo_url
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create trip');

    closeModal('wizard-modal');
    showToast(`Trip "${trip_name}" created successfully! ✈️`, 'success');
    switchTab('mytrips-section');
    loadMyTrips();
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* City Search & Explorer Functions */
function initCityExplorer() {
  loadCities();

  document.getElementById('city-search-input').addEventListener('input', loadCities);
  document.getElementById('city-filter-region').addEventListener('change', loadCities);
  document.getElementById('city-filter-cost').addEventListener('change', loadCities);

  // Form submit handler for Add City to Trip modal
  document.getElementById('add-city-to-trip-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const city_name = document.getElementById('add-city-name-hidden').value;
    const country = document.getElementById('add-city-country-hidden').value;
    const trip_id = document.getElementById('user-trips-select').value;
    const arrival_date = document.getElementById('add-city-arrival').value;
    const departure_date = document.getElementById('add-city-departure').value;
    const stay_days = parseInt(document.getElementById('add-city-stay-days').value, 10) || 1;

    if (!trip_id) {
      showToast('Please select a target trip plan.', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/trips/${trip_id}/stops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({
          city_name,
          country,
          arrival_date,
          departure_date,
          stay_days
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add city stop');

      closeModal('add-city-to-trip-modal');
      showToast(`City stop '${city_name}' added to trip! 📍`, 'success');
      
      // Select this active trip and load it in Itinerary Planner
      state.activeTripId = trip_id;
      switchTab('itinerary-section');
      loadTripStops(trip_id);
      loadFullItinerary(trip_id);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function loadCities() {
  const search = document.getElementById('city-search-input').value.trim();
  const region = document.getElementById('city-filter-region').value;
  const cost_index = document.getElementById('city-filter-cost').value;

  let url = `/api/cities?region=${encodeURIComponent(region)}&cost_index=${encodeURIComponent(cost_index)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      renderCitiesGrid(data.cities);
    }
  } catch (err) {
    console.error('Error loading cities:', err);
  }
}

function renderCitiesGrid(cities) {
  const grid = document.getElementById('cities-grid');

  if (!cities || cities.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-glass);">
        <p style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏙️</p>
        <h3>No Cities Found</h3>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">Try adjusting your search criteria or cost index filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = cities.map(city => `
    <div class="dest-card">
      <div class="dest-img-wrap">
        <img src="${city.image_url}" alt="${city.city_name}" class="dest-img" loading="lazy">
        <span class="dest-badge" style="background: rgba(114, 9, 183, 0.25); color: #c084fc;">
          ${city.region} • ${city.cost_index}
        </span>
      </div>
      <div class="dest-body">
        <div class="dest-location">📍 ${city.city_name}, ${city.country}</div>
        <h3 class="dest-title">${city.city_name}</h3>
        <p class="dest-desc" style="-webkit-line-clamp: 2; margin-bottom: 0.85rem;">${city.description}</p>

        ${city.popular_spots ? `
          <div style="margin-bottom: 1rem; background: rgba(7, 10, 19, 0.5); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-glass);">
            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 600;">Popular Spots:</span>
            <div style="font-size: 0.8rem; color: var(--primary-cyan); font-weight: 600; margin-top: 0.2rem;">
              ✨ ${city.popular_spots}
            </div>
          </div>
        ` : ''}

        <div class="dest-footer">
          <div class="price-tag">${city.cost_index} <span>/ cost level</span></div>
          <button class="btn btn-primary btn-sm" onclick="openAddCityToTripModal('${city.city_name}', '${city.country}')">+ Add to Trip</button>
        </div>
      </div>
    </div>
  `).join('');
}

window.openAddCityToTripModal = async function(cityName, country) {
  if (!state.user) {
    showToast('Please sign in to add cities to your trip plans!', 'error');
    openModal('login-modal');
    return;
  }

  document.getElementById('add-city-modal-title').textContent = `📍 Add ${cityName} to Trip`;
  document.getElementById('add-city-name-hidden').value = cityName;
  document.getElementById('add-city-country-hidden').value = country;

  // Load user trips for dropdown
  try {
    const res = await fetch('/api/trips', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();

    if (!data.success || !data.trips || data.trips.length === 0) {
      showToast('No trips found. Please create a trip first!', 'error');
      openModal('wizard-modal');
      return;
    }

    const select = document.getElementById('user-trips-select');
    select.innerHTML = data.trips.map(t => `
      <option value="${t.id}">${t.trip_name || t.destination_title} (📍 ${t.destination_location})</option>
    `).join('');

    // Pre-fill dates from first trip
    const firstTrip = data.trips[0];
    document.getElementById('add-city-arrival').value = firstTrip.start_date;
    document.getElementById('add-city-departure').value = firstTrip.end_date;

    openModal('add-city-to-trip-modal');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

/* Itinerary Builder & Multi-View Management Functions */
state.activeTripId = null;
state.currentViewMode = 'timeline'; // 'timeline', 'calendar', 'list'
state.activeStops = [];

function initItineraryMultiView() {
  // View mode toggle listeners
  document.getElementById('view-mode-timeline').addEventListener('click', () => setViewMode('timeline'));
  document.getElementById('view-mode-calendar').addEventListener('click', () => setViewMode('calendar'));
  document.getElementById('view-mode-list').addEventListener('click', () => setViewMode('list'));

  // Assign activity button listener
  document.getElementById('add-activity-btn').addEventListener('click', () => {
    if (!state.activeTripId) {
      showToast('Please select or create a trip first to assign activities.', 'error');
      return;
    }
    openModal('add-activity-modal');
  });

  // Assign activity form submit
  document.getElementById('assign-activity-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.activeTripId) return;

    const title = document.getElementById('act-title').value;
    const location = document.getElementById('act-location').value;
    const day_number = parseInt(document.getElementById('act-day').value, 10) || 1;
    const time_slot = document.getElementById('act-time').value;
    const duration = document.getElementById('act-duration').value;
    const cost = parseFloat(document.getElementById('act-cost').value) || 0;
    const category = document.getElementById('act-category').value;

    try {
      const res = await fetch(`/api/trips/${state.activeTripId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({
          day_number,
          title,
          location,
          time_slot,
          duration,
          cost,
          category
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to assign activity');

      closeModal('add-activity-modal');
      e.target.reset();
      showToast(`Activity '${title}' assigned to Day ${day_number}! 🎟️`, 'success');
      loadFullItinerary(state.activeTripId);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

function setViewMode(mode) {
  state.currentViewMode = mode;
  document.querySelectorAll('#itinerary-section .btn-glass').forEach(b => b.classList.remove('active'));
  document.getElementById(`view-mode-${mode}`).classList.add('active');

  document.querySelectorAll('.itinerary-view-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById(`itinerary-${mode}-view`).classList.remove('hidden');

  if (state.activeTripId) {
    loadFullItinerary(state.activeTripId);
  }
}

async function loadTripStops(tripId) {
  if (!state.token || !tripId) return;
  state.activeTripId = tripId;

  try {
    const res = await fetch(`/api/trips/${tripId}/stops`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();

    if (data.success) {
      state.activeStops = data.stops;
      renderStopsRankList(data.stops);
    }
  } catch (err) {
    console.error('Error loading trip stops:', err);
  }
}

function renderStopsRankList(stops) {
  const container = document.getElementById('city-stops-rank-list');

  if (!stops || stops.length === 0) {
    container.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 1rem;">
        No city stops added yet. Click "+ Add City Stop" or use the City Explorer!
      </p>
    `;
    return;
  }

  container.innerHTML = stops.map((stop, index) => `
    <div style="background: rgba(7, 10, 19, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.85rem 1.25rem; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <span style="font-weight: 800; font-size: 1.1rem; color: var(--primary-cyan); background: rgba(0,245,212,0.1); width: 32px; height: 32px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center;">
          ${index + 1}
        </span>
        <div>
          <strong style="font-size: 1.05rem;">📍 ${stop.city_name}, ${stop.country}</strong>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.15rem;">
            🗓️ ${new Date(stop.arrival_date).toLocaleDateString()} - ${new Date(stop.departure_date).toLocaleDateString()} (${stop.stay_days} Days)
          </div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <button class="btn btn-glass btn-sm" onclick="moveStopRank(${index}, -1)" ${index === 0 ? 'disabled style="opacity:0.3;"' : ''} title="Move Up">⬆️</button>
        <button class="btn btn-glass btn-sm" onclick="moveStopRank(${index}, 1)" ${index === stops.length - 1 ? 'disabled style="opacity:0.3;"' : ''} title="Move Down">⬇️</button>
        <button class="btn btn-sm" style="background: rgba(255,0,110,0.15); color: var(--accent-pink);" onclick="deleteStopItem(${stop.id})" title="Remove Stop">🗑️</button>
      </div>
    </div>
  `).join('');
}

window.moveStopRank = async function(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= state.activeStops.length) return;

  // Swap in array
  const temp = state.activeStops[index];
  state.activeStops[index] = state.activeStops[newIndex];
  state.activeStops[newIndex] = temp;

  // Map to payload array
  const payloadStops = state.activeStops.map((s, i) => ({ id: s.id, stop_order: i + 1 }));

  try {
    const res = await fetch(`/api/trips/${state.activeTripId}/stops/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ stops: payloadStops })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast('City stops rank reordered! 🔄', 'success');
    loadTripStops(state.activeTripId);
    loadFullItinerary(state.activeTripId);
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.deleteStopItem = async function(stopId) {
  if (!confirm('Remove this city stop from your trip?')) return;

  try {
    const res = await fetch(`/api/trips/${state.activeTripId}/stops/${stopId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast('City stop removed.', 'success');
    loadTripStops(state.activeTripId);
    loadFullItinerary(state.activeTripId);
  } catch (err) {
    showToast(err.message, 'error');
  }
};

async function loadFullItinerary(tripId) {
  if (!state.token || !tripId) return;
  state.activeTripId = tripId;

  try {
    const res = await fetch(`/api/trips/${tripId}/full-itinerary`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById('trip-title').textContent = `✈️ ${data.trip.trip_name || data.trip.destination_title}`;
      document.getElementById('trip-dates').textContent = `📍 ${data.trip.destination_location} • ${new Date(data.trip.start_date).toLocaleDateString()} - ${new Date(data.trip.end_date).toLocaleDateString()}`;

      // Update costs
      document.getElementById('cost-tours').textContent = `$${data.totalActivityCost.toLocaleString()}`;
      const totalBudget = (data.trip.total_budget || 0) + data.totalActivityCost;
      document.getElementById('cost-total').textContent = `$${totalBudget.toLocaleString()}`;

      if (state.currentViewMode === 'timeline') {
        renderTimelineView(data.itineraryDays);
      } else if (state.currentViewMode === 'calendar') {
        renderCalendarView(data.itineraryDays, data.trip);
      } else if (state.currentViewMode === 'list') {
        renderDetailedListView(data.itineraryDays, data.stops);
      }
    }
  } catch (err) {
    console.error('Error loading full itinerary:', err);
  }
}

function renderTimelineView(itineraryDays) {
  const container = document.getElementById('timeline-list');

  if (!itineraryDays || itineraryDays.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
        <p style="font-size: 2rem; margin-bottom: 0.5rem;">🎟️</p>
        <p>No activities assigned yet. Click "+ Assign Activity" to start building your daily timeline!</p>
      </div>
    `;
    return;
  }

  let html = '';
  for (const day of itineraryDays) {
    for (const act of day.activities) {
      html += `
        <div class="timeline-item">
          <div class="timeline-node">D${day.day_number}</div>
          <div class="timeline-content">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
              <div>
                <strong style="font-size: 1.1rem; color: white;">${act.title}</strong>
                ${act.location ? `<div style="font-size: 0.82rem; color: var(--text-muted);">📍 ${act.location}</div>` : ''}
              </div>
              <strong style="color: var(--primary-cyan); font-size: 1.1rem;">$${act.cost || 0}</strong>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; font-size: 0.78rem;">
                ${act.time_slot ? `<span class="status-pill badge-gold">⏰ ${act.time_slot}</span>` : ''}
                ${act.duration ? `<span class="status-pill badge-purple">⏳ ${act.duration}</span>` : ''}
                <span class="status-pill" style="background: rgba(0, 245, 212, 0.1); color: var(--primary-cyan);">📂 ${act.category || 'Sightseeing'}</span>
              </div>
              <button class="btn btn-glass btn-sm" onclick="openEditTimeModal(${act.id}, '${act.time_slot || ''}', '${act.duration || ''}', ${day.day_number})" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">✏️ Edit Time</button>
            </div>
          </div>
        </div>
      `;
    }
  }

  container.innerHTML = html;
}

function renderCalendarView(itineraryDays, trip) {
  const container = document.getElementById('calendar-grid-list');

  if (!itineraryDays || itineraryDays.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <p style="font-size: 2rem; margin-bottom: 0.5rem;">🗓️</p>
        <p>No days scheduled yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = itineraryDays.map(day => `
    <div style="background: rgba(7, 10, 19, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-glass); padding-bottom: 0.5rem; margin-bottom: 0.75rem;">
        <span style="font-weight: 700; color: var(--primary-cyan);">Day ${day.day_number}</span>
        <span style="font-size: 0.75rem; color: var(--text-dim);">${day.activities.length} Activities</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        ${day.activities.map(a => `
          <div style="background: var(--bg-card); padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-glass); font-size: 0.85rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: white;">${a.title}</strong>
              <button class="btn btn-glass btn-sm" onclick="openEditTimeModal(${a.id}, '${a.time_slot || ''}', '${a.duration || ''}', ${day.day_number})" style="font-size: 0.7rem; padding: 0.15rem 0.35rem;">✏️</button>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 0.25rem; color: var(--text-muted); font-size: 0.75rem;">
              <span>⏰ ${a.time_slot || 'Flexible'}</span>
              <strong style="color: var(--primary-cyan);">$${a.cost || 0}</strong>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderDetailedListView(itineraryDays, stops) {
  const container = document.getElementById('detailed-list-table-container');

  let html = `
    <div style="background: rgba(7, 10, 19, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
        <thead>
          <tr style="background: rgba(0, 245, 212, 0.1); color: var(--primary-cyan); border-bottom: 1px solid var(--border-glass);">
            <th style="padding: 0.85rem 1rem;">Day #</th>
            <th style="padding: 0.85rem 1rem;">Activity Title</th>
            <th style="padding: 0.85rem 1rem;">Location</th>
            <th style="padding: 0.85rem 1rem;">Timing</th>
            <th style="padding: 0.85rem 1rem;">Category</th>
            <th style="padding: 0.85rem 1rem;">Est. Cost</th>
            <th style="padding: 0.85rem 1rem;">Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  for (const day of itineraryDays) {
    for (const act of day.activities) {
      html += `
        <tr style="border-bottom: 1px solid var(--border-glass);">
          <td style="padding: 0.75rem 1rem; font-weight: 700;">Day ${day.day_number}</td>
          <td style="padding: 0.75rem 1rem; color: white; font-weight: 600;">${act.title}</td>
          <td style="padding: 0.75rem 1rem; color: var(--text-muted);">${act.location || '—'}</td>
          <td style="padding: 0.75rem 1rem; color: var(--text-muted);">${act.time_slot || '—'} (${act.duration || 'N/A'})</td>
          <td style="padding: 0.75rem 1rem;"><span class="status-pill badge-purple" style="font-size: 0.75rem;">${act.category || 'Sightseeing'}</span></td>
          <td style="padding: 0.75rem 1rem; font-weight: 700; color: var(--primary-cyan);">$${act.cost || 0}</td>
          <td style="padding: 0.75rem 1rem;">
            <button class="btn btn-glass btn-sm" onclick="openEditTimeModal(${act.id}, '${act.time_slot || ''}', '${act.duration || ''}', ${day.day_number})" style="font-size: 0.75rem;">✏️ Edit Time</button>
          </td>
        </tr>
      `;
    }
  }

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

    container.innerHTML = html;
}

/* Activity Search & Discovery Functions */
function initActivityDiscovery() {
  loadActivities();

  document.getElementById('act-search-input').addEventListener('input', loadActivities);
  document.getElementById('act-filter-category').addEventListener('change', loadActivities);
  document.getElementById('act-filter-duration').addEventListener('change', loadActivities);

  const range = document.getElementById('act-filter-cost-range');
  const costVal = document.getElementById('act-cost-val');
  range.addEventListener('input', () => {
    costVal.textContent = range.value;
    loadActivities();
  });
}

async function loadActivities() {
  const search = document.getElementById('act-search-input').value.trim();
  const category = document.getElementById('act-filter-category').value;
  const max_cost = document.getElementById('act-filter-cost-range').value;
  const duration = document.getElementById('act-filter-duration').value;

  let url = `/api/activities?category=${encodeURIComponent(category)}&max_cost=${encodeURIComponent(max_cost)}&duration=${encodeURIComponent(duration)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      renderActivitiesGrid(data.activities);
    }
  } catch (err) {
    console.error('Error loading activities:', err);
  }
}

function renderActivitiesGrid(activities) {
  const grid = document.getElementById('activities-catalog-grid');

  if (!activities || activities.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-glass);">
        <p style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎟️</p>
        <h3>No Activities Found</h3>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">Try adjusting your category filter or max cost range.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = activities.map(act => `
    <div class="dest-card">
      <div class="dest-img-wrap">
        <img src="${act.image_url}" alt="${act.title}" class="dest-img" loading="lazy">
        <span class="dest-badge">⭐ ${act.rating} • ${act.category}</span>
      </div>
      <div class="dest-body">
        <div class="dest-location">📍 ${act.city_name}, ${act.country}</div>
        <h3 class="dest-title">${act.title}</h3>
        <p class="dest-desc" style="-webkit-line-clamp: 2; margin-bottom: 0.75rem;">${act.description}</p>
        
        <div style="display: flex; gap: 0.5rem; font-size: 0.8rem; margin-bottom: 1rem;">
          <span class="status-pill badge-purple">⏳ ${act.duration || 'Flexible'}</span>
        </div>

        <div class="dest-footer">
          <div class="price-tag">$${act.cost} <span>/ est. cost</span></div>
          <button class="btn btn-glass btn-sm" onclick="openActivityPreviewModal(${act.id})">Preview Details →</button>
        </div>
      </div>
    </div>
  `).join('');
}

window.openActivityPreviewModal = async function(actId) {
  try {
    const res = await fetch(`/api/activities/${actId}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const act = data.activity;
    const content = document.getElementById('activity-modal-content');

    content.innerHTML = `
      <div style="height: 220px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 1.25rem;">
        <img src="${act.image_url}" alt="${act.title}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
      <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
        <span class="status-pill badge-gold">⭐ ${act.rating} Rating</span>
        <span class="status-pill badge-purple">📂 ${act.category}</span>
        <span class="status-pill" style="background: rgba(0,245,212,0.1); color: var(--primary-cyan);">⏳ ${act.duration}</span>
      </div>
      <h2 style="font-size: 1.6rem; margin: 0.5rem 0;">${act.title}</h2>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">📍 ${act.city_name}, ${act.country}</p>
      <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 1.5rem;">${act.description}</p>
      
      <div style="background: rgba(7,10,19,0.5); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
        <span>Estimated Cost Per Person:</span>
        <strong style="font-size: 1.5rem; color: var(--primary-cyan);">$${act.cost}</strong>
      </div>

      <div style="display: flex; gap: 1rem;">
        <button class="btn btn-accent" style="flex: 1;" onclick="assignActivityFromPreview('${act.title}', '${act.city_name}', ${act.cost}, '${act.category}', '${act.duration}')">🎟️ Assign to My Trip</button>
        <button class="btn btn-glass" onclick="closeModal('activity-detail-modal')">Close</button>
      </div>
    `;

    openModal('activity-detail-modal');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.assignActivityFromPreview = function(title, location, cost, category, duration) {
  if (!state.user) {
    showToast('Please sign in to assign activities to your trips!', 'error');
    openModal('login-modal');
    return;
  }

  closeModal('activity-detail-modal');
  document.getElementById('act-title').value = title;
  document.getElementById('act-location').value = location;
  document.getElementById('act-cost').value = cost;
  document.getElementById('act-category').value = category || 'Sightseeing';
  document.getElementById('act-duration').value = duration || '2 hours';

  switchTab('itinerary-section');
  if (state.activeTripId) {
    openModal('add-activity-modal');
  } else {
    showToast('Please select or create a trip plan first!', 'error');
  }
};

/* Trip Budget Analytics & Financial Dashboard Functions */
function initBudgetAnalytics() {
  document.getElementById('budget-trip-picker').addEventListener('change', (e) => {
    const tripId = e.target.value;
    if (tripId) loadBudgetAnalyticsData(tripId);
  });

  // Add Expense form submit
  document.getElementById('add-expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const trip_id = document.getElementById('budget-trip-picker').value;
    if (!trip_id) {
      showToast('Please select a trip first.', 'error');
      return;
    }

    const category = document.getElementById('exp-category').value;
    const amount = parseFloat(document.getElementById('exp-amount').value) || 0;
    const day_number = parseInt(document.getElementById('exp-day').value, 10) || 1;
    const description = document.getElementById('exp-description').value;

    try {
      const res = await fetch(`/api/trips/${trip_id}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ category, amount, day_number, description })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to log expense');

      e.target.reset();
      showToast('Expense logged successfully! 💳', 'success');
      loadBudgetAnalyticsData(trip_id);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function loadBudgetAnalyticsTrips() {
  if (!state.token) return;

  try {
    const res = await fetch('/api/trips', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();

    if (data.success && data.trips && data.trips.length > 0) {
      const picker = document.getElementById('budget-trip-picker');
      picker.innerHTML = data.trips.map(t => `
        <option value="${t.id}">${t.trip_name || t.destination_title} ($${t.total_budget || 0})</option>
      `).join('');

      // Load first trip budget analytics
      loadBudgetAnalyticsData(data.trips[0].id);
    }
  } catch (err) {
    console.error('Error loading budget trips:', err);
  }
}

async function loadBudgetAnalyticsData(tripId) {
  if (!state.token || !tripId) return;

  try {
    const res = await fetch(`/api/trips/${tripId}/budget-analytics`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();

    if (data.success) {
      const s = data.tripSummary;
      document.getElementById('analytics-target-budget').textContent = `$${s.total_budget.toLocaleString()}`;
      document.getElementById('analytics-total-spent').textContent = `$${s.totalSpent.toLocaleString()}`;
      document.getElementById('analytics-remaining-budget').textContent = `$${s.remainingBudget.toLocaleString()}`;
      document.getElementById('analytics-daily-avg').textContent = `$${s.dailyAverage.toLocaleString()} / day`;

      renderSmartBudgetAlerts(data.alerts);
      renderCategoryBreakdown(data.categoryTotals, s.totalSpent);
    }
  } catch (err) {
    console.error('Error loading budget analytics:', err);
  }
}

function renderSmartBudgetAlerts(alerts) {
  const container = document.getElementById('budget-alerts-container');

  if (!alerts || alerts.length === 0) {
    container.innerHTML = `
      <div style="background: rgba(0, 245, 212, 0.1); border: 1px solid var(--primary-cyan); border-radius: var(--radius-md); padding: 0.85rem 1.25rem; font-size: 0.9rem; color: var(--primary-cyan); display: flex; align-items: center; gap: 0.75rem;">
        <span>✅</span>
        <div>Your trip expenses are well balanced and within your target daily budget!</div>
      </div>
    `;
    return;
  }

  container.innerHTML = alerts.map(a => `
    <div style="background: rgba(255, 0, 110, 0.15); border: 1px solid var(--accent-pink); border-radius: var(--radius-md); padding: 0.85rem 1.25rem; font-size: 0.9rem; color: #ff85b3; display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
      <span>⚠️</span>
      <div>${a.message}</div>
    </div>
  `).join('');
}

function renderCategoryBreakdown(categoryTotals, totalSpent) {
  const container = document.getElementById('category-breakdown-bars');

  const categories = [
    { key: 'Transport', icon: '🚄', color: 'var(--primary-cyan)' },
    { key: 'Accommodation', icon: '🏨', color: '#c084fc' },
    { key: 'Activities', icon: '🎟️', color: 'var(--accent-pink)' },
    { key: 'Food/Dining', icon: '🍱', color: 'var(--accent-gold)' },
    { key: 'Other', icon: '🛍️', color: '#94a3b8' }
  ];

  container.innerHTML = categories.map(c => {
    const amt = categoryTotals[c.key] || 0;
    const pct = totalSpent > 0 ? Math.min(100, Math.round((amt / totalSpent) * 100)) : 0;

    return `
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.35rem;">
          <span>${c.icon} <strong>${c.key}</strong></span>
          <strong style="color: ${c.color};">$${amt.toLocaleString()} (${pct}%)</strong>
        </div>
        <div style="height: 10px; background: var(--bg-dark); border-radius: var(--radius-full); overflow: hidden;">
          <div style="height: 100%; width: ${pct}%; background: ${c.color}; transition: width 0.4s ease;"></div>
        </div>
      </div>
    `;
  }).join('');
}

/* Shared / Public Itinerary View Screen Functions */
let currentPublicShareCode = null;

function initPublicShareScreen() {
  // Check URL query parameters for ?share=CODE
  const urlParams = new URLSearchParams(window.location.search);
  const shareParam = urlParams.get('share');

  if (shareParam) {
    switchTab('public-share-section');
    loadPublicShareData(shareParam);
  }

  // Clone trip button handlers
  const handleClone = () => {
    if (!currentPublicShareCode) return;
    cloneTripToMyAccount(currentPublicShareCode);
  };

  document.getElementById('clone-public-trip-btn').addEventListener('click', handleClone);
  document.getElementById('public-clone-sidebar-btn').addEventListener('click', handleClone);

  // Copy link button handler
  document.getElementById('share-copy-link-btn').addEventListener('click', () => {
    if (!currentPublicShareCode) return;
    const shareUrl = `${window.location.origin}/?share=${currentPublicShareCode}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Public itinerary link copied to clipboard! 📋', 'success');
  });
}

async function loadPublicShareData(shareCode) {
  currentPublicShareCode = shareCode;

  try {
    const res = await fetch(`/api/trips/share/${shareCode}`);
    const data = await res.json();

    if (!data.success) {
      showToast(data.message || 'Public itinerary not found.', 'error');
      switchTab('dashboard-section');
      return;
    }

    const t = data.trip;
    document.getElementById('public-share-title').textContent = t.trip_name || t.destination_title;
    document.getElementById('public-share-subtitle').textContent = `📍 ${t.destination_location} • 🗓️ ${new Date(t.start_date).toLocaleDateString()} - ${new Date(t.end_date).toLocaleDateString()}`;
    document.getElementById('public-share-owner').textContent = `👤 Shared by ${t.owner_name || 'Explorer'}`;
    document.getElementById('public-share-cover').src = t.cover_photo_url || t.image_url || 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99';

    // Calculate total budget
    const actTotal = data.activities ? data.activities.reduce((a, b) => a + (b.cost || 0), 0) : 0;
    const grandTotal = (t.total_budget || 0) + actTotal;
    document.getElementById('public-share-budget').textContent = `$${grandTotal.toLocaleString()}`;

    // Setup social sharing URLs
    const fullShareUrl = encodeURIComponent(`${window.location.origin}/?share=${shareCode}`);
    const shareTitle = encodeURIComponent(`Check out this travel itinerary: ${t.trip_name || t.destination_title}!`);

    document.getElementById('share-twitter-btn').href = `https://twitter.com/intent/tweet?text=${shareTitle}&url=${fullShareUrl}`;
    document.getElementById('share-whatsapp-btn').href = `https://api.whatsapp.com/send?text=${shareTitle}%20${fullShareUrl}`;

    // Render Public Stops List
    renderPublicStops(data.stops);

    // Render Public Activities Timeline
    renderPublicActivities(data.activities);
  } catch (err) {
    console.error('Error loading public shared trip:', err);
    showToast('Failed to load shared itinerary.', 'error');
  }
}

function renderPublicStops(stops) {
  const container = document.getElementById('public-stops-list');

  if (!stops || stops.length === 0) {
    container.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.9rem;">No specific city stops configured.</p>
    `;
    return;
  }

  container.innerHTML = stops.map((stop, i) => `
    <div style="background: rgba(7, 10, 19, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.85rem 1.25rem; display: flex; align-items: center; gap: 1rem;">
      <span style="font-weight: 800; font-size: 1.1rem; color: var(--primary-cyan); background: rgba(0,245,212,0.1); width: 32px; height: 32px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center;">
        ${i + 1}
      </span>
      <div>
        <strong style="font-size: 1.05rem;">📍 ${stop.city_name}, ${stop.country}</strong>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.15rem;">
          🗓️ ${new Date(stop.arrival_date).toLocaleDateString()} - ${new Date(stop.departure_date).toLocaleDateString()} (${stop.stay_days} Days)
        </div>
      </div>
    </div>
  `).join('');
}

function renderPublicActivities(activities) {
  const container = document.getElementById('public-activities-timeline');

  if (!activities || activities.length === 0) {
    container.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.9rem;">No daily activities scheduled.</p>
    `;
    return;
  }

  // Group by day_number
  const dayMap = {};
  for (const act of activities) {
    const d = act.day_number || 1;
    if (!dayMap[d]) dayMap[d] = [];
    dayMap[d].push(act);
  }

  let html = '';
  Object.keys(dayMap).forEach(day => {
    for (const act of dayMap[day]) {
      html += `
        <div class="timeline-item">
          <div class="timeline-node">D${day}</div>
          <div class="timeline-content">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
              <div>
                <strong style="font-size: 1.1rem; color: white;">${act.title}</strong>
                ${act.location ? `<div style="font-size: 0.82rem; color: var(--text-muted);">📍 ${act.location}</div>` : ''}
              </div>
              <strong style="color: var(--primary-cyan); font-size: 1.1rem;">$${act.cost || 0}</strong>
            </div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; font-size: 0.78rem;">
              ${act.time_slot ? `<span class="status-pill badge-gold">⏰ ${act.time_slot}</span>` : ''}
              ${act.duration ? `<span class="status-pill badge-purple">⏳ ${act.duration}</span>` : ''}
              <span class="status-pill" style="background: rgba(0, 245, 212, 0.1); color: var(--primary-cyan);">📂 ${act.category || 'Sightseeing'}</span>
            </div>
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = html;
}

/* Saved Wishlist Functions */
async function loadWishlist() {
  if (!state.token) return;

  try {
    const res = await fetch('/api/auth/wishlist', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();

    if (data.success) {
      renderWishlistGrid(data.wishlist);
    }
  } catch (err) {
    console.error('Error loading wishlist:', err);
  }
}

function renderWishlistGrid(items) {
  const grid = document.getElementById('wishlist-grid');

  if (!items || items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
        <p style="font-size: 2rem; margin-bottom: 0.5rem;">❤️</p>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Your wishlist is empty. Save destinations & cities while exploring!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="dest-card" style="font-size: 0.85rem;">
      <div class="dest-img-wrap" style="height: 130px;">
        <img src="${item.image_url}" alt="${item.title}" class="dest-img">
        <span class="dest-badge">❤️ Wishlist</span>
      </div>
      <div class="dest-body" style="padding: 0.85rem;">
        <div class="dest-location">📍 ${item.location}</div>
        <h4 style="color: white; margin: 0.25rem 0 0.5rem; font-size: 0.95rem;">${item.title}</h4>
        <button class="btn btn-sm" style="width: 100%; background: rgba(255,0,110,0.15); color: var(--accent-pink); border: 1px solid rgba(255,0,110,0.3);" onclick="removeFromWishlistGlobal(${item.id})">🗑️ Remove</button>
      </div>
    </div>
  `).join('');
}

window.addToWishlistGlobal = async function(title, location, image_url) {
  if (!state.token) {
    showToast('Please sign in to save items to your wishlist!', 'error');
    openModal('login-modal');
    return;
  }

  try {
    const res = await fetch('/api/auth/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ title, location, image_url })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast(data.message, 'success');
    loadWishlist();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.removeFromWishlistGlobal = async function(id) {
  if (!state.token) return;

  try {
    const res = await fetch(`/api/auth/wishlist/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast('Item removed from wishlist.', 'success');
    loadWishlist();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

/* Account Management - Delete Account */
document.getElementById('delete-account-btn').addEventListener('click', async () => {
  if (!confirm('⚠️ Are you absolutely sure you want to permanently delete your GlobeTrotter account? All your saved trips will be lost.')) return;

  try {
    const res = await fetch('/api/auth/account', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast('Account deleted. We hope to see you again!', 'success');
    logoutUser();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

/* Platform Admin & Analytics Dashboard Functions */
async function loadAdminDashboard() {
  if (!state.token || !state.user || state.user.role !== 'admin') return;

  try {
    // 1. Fetch Analytics Stats
    const statsRes = await fetch('/api/admin/analytics', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const statsData = await statsRes.json();

    if (statsData.success) {
      const s = statsData.stats;
      document.getElementById('admin-stat-users').textContent = s.totalUsers;
      document.getElementById('admin-stat-trips').textContent = s.totalTrips;
      document.getElementById('admin-stat-stops').textContent = s.totalStops;
      document.getElementById('admin-stat-activities').textContent = s.totalActivities;

      renderAdminPopularDestinations(statsData.popularDestinations);
      renderAdminActivityCategories(statsData.topActivityCategories);
    }

    // 2. Fetch All Users
    const usersRes = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const usersData = await usersRes.json();

    if (usersData.success) {
      renderAdminUsersTable(usersData.users);
    }
  } catch (err) {
    console.error('Error loading admin dashboard:', err);
  }
}

function renderAdminPopularDestinations(destinations) {
  const container = document.getElementById('admin-popular-destinations-list');

  if (!destinations || destinations.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No trip destination data yet.</p>`;
    return;
  }

  container.innerHTML = destinations.map(d => `
    <div style="background: rgba(7, 10, 19, 0.5); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-glass); display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem;">
      <span>📍 <strong>${d.location}</strong></span>
      <span class="status-pill badge-gold">${d.trip_count} ${d.trip_count === 1 ? 'Trip' : 'Trips'}</span>
    </div>
  `).join('');
}

function renderAdminActivityCategories(categories) {
  const container = document.getElementById('admin-activity-categories-list');

  if (!categories || categories.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No activity data yet.</p>`;
    return;
  }

  container.innerHTML = categories.map(c => `
    <div style="background: rgba(7, 10, 19, 0.5); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-glass); display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem;">
      <span>📂 <strong>${c.category}</strong></span>
      <span class="status-pill badge-purple">${c.count} Scheduled</span>
    </div>
  `).join('');
}

function renderAdminUsersTable(users) {
  const tbody = document.getElementById('admin-users-table-body');

  tbody.innerHTML = users.map(u => `
    <tr style="border-bottom: 1px solid var(--border-glass);">
      <td style="padding: 0.75rem 1rem; font-weight: 700;">#${u.id}</td>
      <td style="padding: 0.75rem 1rem; color: white; font-weight: 600;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: var(--bg-dark);">
            ${u.name.charAt(0).toUpperCase()}
          </div>
          ${u.name}
        </div>
      </td>
      <td style="padding: 0.75rem 1rem; color: var(--text-muted);">${u.email}</td>
      <td style="padding: 0.75rem 1rem;">
        <span class="status-pill ${u.role === 'admin' ? 'badge-gold' : 'badge-purple'}" style="font-size: 0.75rem;">
          ${u.role === 'admin' ? '⚡ Admin' : '👤 User'}
        </span>
      </td>
      <td style="padding: 0.75rem 1rem; color: var(--text-dim); font-size: 0.8rem;">${new Date(u.created_at).toLocaleDateString()}</td>
      <td style="padding: 0.75rem 1rem;">
        <button class="btn btn-glass btn-sm" onclick="toggleUserRole(${u.id}, '${u.role === 'admin' ? 'user' : 'admin'}')" style="font-size: 0.75rem;">
          ${u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
        </button>
      </td>
    </tr>
  `).join('');
}

window.toggleUserRole = async function(userId, newRole) {
  try {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ role: newRole })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast(data.message, 'success');
    loadAdminDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
};





