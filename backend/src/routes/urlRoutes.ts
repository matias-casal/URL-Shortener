import { Router } from "express";
import { body } from "express-validator";
import {
  createShortUrl,
  redirectToOriginalUrl,
  getUrlDetails,
  updateUrl,
  getUserUrls,
  assignToUser,
  getRedirectInfo,
} from "../controllers/urlController";
import { requireAuth } from "../middleware/auth";
import { rateLimiterMiddleware } from "../middleware/rateLimiter";

const router = Router();

/**
 * POST /api/urls
 * Creates a new shortened URL
 * Rate limited to prevent abuse
 */
router.post(
  "/",
  rateLimiterMiddleware,
  [body("originalUrl").isURL().withMessage("Must be a valid URL")],
  createShortUrl
);

/**
 * GET /api/urls/redirect/:slug
 * Returns redirection information for frontend handling
 */
router.get("/redirect/:slug", getRedirectInfo);

/**
 * GET /api/urls/:slug
 * Direct server-side redirection (deprecated)
 */
router.get("/:slug", redirectToOriginalUrl);

/**
 * GET /api/urls/details/:id
 * Retrieves URL details by ID
 */
router.get("/details/:id", getUrlDetails);

/**
 * PUT /api/urls/:id
 * Updates an existing URL (authenticated)
 */
router.put(
  "/:id",
  requireAuth,
  [
    body("originalUrl").optional().isURL().withMessage("Must be a valid URL"),
    body("customSlug")
      .optional()
      .isString()
      .isLength({ min: 3 })
      .withMessage("Slug must be at least 3 characters"),
  ],
  updateUrl
);

/**
 * GET /api/urls/user/urls
 * Retrieves all URLs for the authenticated user
 */
router.get("/user/urls", requireAuth, getUserUrls);

/**
 * PUT /api/urls/:id/assign-to-user
 * Claims/assigns a URL to the authenticated user
 */
router.put("/:id/assign-to-user", requireAuth, assignToUser);

export default router;
