const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
// Make compression optional so missing dep won't crash
let compression;
try { compression = require('compression'); } catch { compression = null; }
// helmet adds helpful security headers and can slightly improve Lighthouse best practices
let helmet;
try { helmet = require('helmet'); } catch { helmet = null; }
require('dotenv').config();
// Validate critical environment configuration (fails fast in production)
try {
  require('./config/validateEnv').validateEnv();
} catch (e) {
  console.error('Environment validation failed – exiting.');
  process.exit(1);
}

// Capture process start for uptime calculations & health reporting
const START_TIME = Date.now();
// Common CI/CD providers (Render sets RENDER_GIT_COMMIT / RENDER_GIT_BRANCH)
const COMMIT = process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || process.env.VERCEL_GIT_COMMIT || null;
const BRANCH = process.env.RENDER_GIT_BRANCH || process.env.GIT_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || null;

const app = express();
app.disable('x-powered-by');
// Conditional CORS: restrict in production when FRONTEND_URL provided, open in dev
if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS']
  }));
} else {
  app.use(cors()); // permissive for development & local tools
}
app.use(express.json());
if (compression) app.use(compression());
if (helmet) app.use(helmet());

const placeRoutes = require('./routes/placeRoutes');
const guideRoutes = require('./routes/guideRoutes');
const festivalRoutes = require('./routes/festivalRoutes');
const alertRoutes = require('./routes/alertRoutes');
const regionRoutes = require('./routes/regionRoutes');
const stateRoutes = require('./routes/stateRoutes');
const authRoutes = require('./routes/authRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');
const connectRoutes = require('./routes/connectRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const currencyRoutes = require('./routes/currencyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Routes
app.get('/', (req, res) => res.send('🌍 Yatra360 API Running...'));
app.use('/api/places', placeRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/festivals', festivalRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/connect', connectRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health / debugging endpoint: recursively enumerates mounted routes (Express 5 compatible)
app.get('/api/health', (req, res) => {
  const routes = [];
  const mounts = new Set();
  const seen = new Set();

  function addRoute(method, path) {
    const key = method + ' ' + path;
    if (!seen.has(key)) {
      seen.add(key);
      routes.push({ method, path });
    }
  }

  function walkLayers(stack, prefix = '') {
    if (!Array.isArray(stack)) return;
    stack.forEach(layer => {
      // Express 5 attaches 'path' on layers when mounted (sometimes an array)
      let layerPaths = [];
      if (layer.path) {
        layerPaths = Array.isArray(layer.path) ? layer.path : [layer.path];
      }
      if (layer.route) {
        const routePath = layer.route.path || '';
        const methods = Object.keys(layer.route.methods || {}).filter(Boolean).map(m => m.toUpperCase());
        const basePaths = layerPaths.length ? layerPaths : [''];
        basePaths.forEach(bp => {
          methods.forEach(m => addRoute(m, (prefix + bp + routePath).replace(/\/+/g, '/')));
        });
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        const basePaths = layerPaths.length ? layerPaths : [''];
        basePaths.forEach(bp => {
          const newPrefix = (prefix + bp).replace(/\/+/g, '/');
          if (newPrefix) mounts.add(newPrefix.startsWith('/') ? newPrefix : '/' + newPrefix);
          walkLayers(layer.handle.stack, newPrefix);
        });
      }
    });
  }

  if (app._router && app._router.stack) {
    walkLayers(app._router.stack, '');
  }

  routes.sort((a,b) => a.path === b.path ? a.method.localeCompare(b.method) : a.path.localeCompare(b.path));
  const mem = process.memoryUsage();
  const ready = app.get('ready');
  let dbName = null;
  if (mongoose.connection && mongoose.connection.name) dbName = mongoose.connection.name;
  res.json({
    status: ready ? 'ready' : 'initializing',
    time: new Date().toISOString(),
    uptimeSeconds: Number(process.uptime().toFixed(2)),
    startTime: new Date(START_TIME).toISOString(),
    pid: process.pid,
    node: process.version,
    env: process.env.NODE_ENV || 'development',
    commit: COMMIT,
    branch: BRANCH,
    memory: { rss: mem.rss, heapUsed: mem.heapUsed },
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'not-connected',
    dbName,
    mounts: Array.from(mounts).sort(),
    routeCount: routes.length,
    routes
  });
});

// In production, serve the React build with aggressive caching for static assets
const buildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath, {
    etag: true,
    lastModified: true,
    maxAge: '365d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  // SPA fallback (exclude API routes); Express v5 requires a valid pattern, use regex
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// DB Connect (with retry + optional db name injection) and deferred server start
const { connectMongo } = require('./config/db');
let server; // will hold http server instance once listening
app.set('ready', false);

async function start() {
  try {
    await connectMongo();
    const PORT = process.env.PORT || 5000;
    server = app.listen(PORT, () => {
      app.set('ready', true);
      console.log(`🚀 Server running on port ${PORT} (Mongo connected)`);
    });
  } catch (err) {
    console.error('❌ Failed to establish initial Mongo connection after retries:', err);
    process.exit(1);
  }
}
start();

// Graceful shutdown helper (handlers added in a later task for clarity)
async function gracefulShutdown(signal) {
  if (!server) return process.exit(0);
  console.log(`\n${signal} received: closing server...`);
  app.set('ready', false);
  const timeout = setTimeout(() => {
    console.error('Force exit after timeout');
    process.exit(1);
  }, 10000).unref();
  try {
    await new Promise(res => server.close(res));
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Mongo connection closed');
    }
    clearTimeout(timeout);
    console.log('Shutdown complete');
    process.exit(0);
  } catch (e) {
    console.error('Error during shutdown', e);
    process.exit(1);
  }
}
// Export for potential test harness usage
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = { app, start, gracefulShutdown, START_TIME, COMMIT, BRANCH };
