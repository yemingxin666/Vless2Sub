/**
 * Routes Definition
 *
 * Defines all application routes.
 * Follows Single Responsibility Principle.
 */

import express from 'express';
import { authenticate, isTokenRootPath } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { renderUI } from '../controllers/ui.js';
import { generateSubscription } from '../controllers/subscription.js';
import config from '../config/index.js';

const router = express.Router();

/**
 * Token root path - UI page
 */
router.get('/:token', authenticate, asyncHandler(async (req, res) => {
  return renderUI(req, res);
}));

/**
 * Subscription generation
 */
router.get('/:token/sub', authenticate, asyncHandler(async (req, res) => {
  return generateSubscription(req, res);
}));

/**
 * Other token paths - default to UI
 */
router.get('/:token/*', authenticate, asyncHandler(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  // Check if this is a subscription request
  if (pathname.includes('/sub')) {
    return generateSubscription(req, res);
  }

  // Default: render UI
  return renderUI(req, res);
}));

export default router;
