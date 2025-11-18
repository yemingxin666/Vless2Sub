/**
 * Server Entry Point
 *
 * Starts the Express server.
 */

import app from './src/app.js';
import config from './src/config/index.js';

const PORT = config.server.port;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 ${config.subscription.name} Server Started                ║
║                                                           ║
║   Environment: ${config.server.env.padEnd(10)}                              ║
║   Port:        ${PORT.toString().padEnd(10)}                              ║
║   URL:         http://localhost:${PORT}                      ║
║                                                           ║
║   Access Tokens: ${config.auth.tokens.join(', ')}                        ║
║                                                           ║
║   📝 Visit http://localhost:${PORT}/${config.auth.tokens[0]} to get started  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    console.log('Server closed. Exiting process.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
