/**
 * Express Application
 *
 * Main Express application setup.
 * Follows Single Responsibility Principle - only handles app configuration.
 */

import express from 'express';
import cors from 'cors';
import config, { validateConfig } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Validate configuration on startup
validateConfig();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy (for getting real client IP behind reverse proxy)
app.set('trust proxy', true);

// Request logging middleware (development only)
if (config.server.env === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Serve CSV files from cloudflare-speedtest results
app.use('/csv', express.static('../cloudflare-speedtest/results'));

// Main routes
app.use('/', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
