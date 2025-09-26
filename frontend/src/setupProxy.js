const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Only proxy API routes, leave HMR and static assets to CRA
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      // Optionally forward websockets if needed for any realtime API
      ws: false,
      logLevel: 'warn',
    })
  );
};
