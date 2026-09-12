import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import cityRoutes from './routes/cityRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite database schema
initDb();

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for dev/testing
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'GlobeTrotter Backend API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/admin', adminRoutes);

// Root route to serve frontend index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API 404 Handler (matches any unhandled /api request)
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Catch-all SPA route handler (serves index.html for any unhandled GET request)
app.use((req, res) => {
  if (req.method === 'GET') {
    const indexPath = path.join(__dirname, '../public/index.html');
    return res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(404).send('Frontend static files not found.');
      }
    });
  }
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 GlobeTrotter Backend API running on http://localhost:${PORT}`);
    console.log(`🔑 Auth Endpoints active at http://localhost:${PORT}/api/auth`);
  });
}

export default app;
