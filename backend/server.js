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

const app = express();
app.disable('x-powered-by');
app.use(cors());
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
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    pid: process.pid,
    memory: { rss: mem.rss, heapUsed: mem.heapUsed },
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'not-connected',
    mounts: Array.from(mounts).sort(),
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

// DB Connect
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yatra360';
if (!process.env.MONGO_URI) {
  console.warn('⚠️  MONGO_URI not set. Falling back to', mongoUri);
}
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ DB Error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
