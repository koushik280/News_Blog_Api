import express from "express";
import {
  getNews,
  createNews,
  updateNews,
  deleteNews,
  getNewsByBody,
} from "../controller/news.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();
/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Get news (filter, search, pagination, sorting, date range)
 *     description: |
 *       Fetch news articles with advanced filtering options.
 *
 *       🔓 Public API
 *
 *       Supports:
 *       - Filter by category (slug or ObjectId)
 *       - Search by keyword (title, content)
 *       - Pagination
 *       - Sorting
 *       - Date range filtering
 *
 *     tags: [News]
 *
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           example: technology
 *         description: Category slug OR category ObjectId
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: ai
 *         description: Search keyword (title, content)
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, oldest, title_asc, title_desc]
 *           example: latest
 *         description: Sorting option
 *
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2026-01-01
 *         description: Filter news published after this date
 *
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2026-01-31
 *         description: Filter news published before this date
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number (optional)
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of results per page (optional)
 *
 *     responses:
 *       200:
 *         description: News fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/News'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalResults:
 *                       type: integer
 *
 *       400:
 *         description: Invalid query parameters (e.g., invalid date)
 *
 *       404:
 *         description: Category not found (optional depending on implementation)
 */

router.get("/", getNews);

/**
 * @swagger
 * /api/news/filter:
 *   post:
 *     summary: Filter news using request body
 *     description: |
 *       Advanced filtering using JSON payload instead of query params.
 *
 *     tags: [News]
 *
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 example: technology
 *                 description: Category slug OR ObjectId
 *
 *               search:
 *                 type: string
 *                 example: ai
 *
 *               sort:
 *                 type: string
 *                 enum: [latest, oldest, title_asc, title_desc]
 *
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-01-01
 *
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-01-31
 *
 *               page:
 *                 type: integer
 *                 example: 1
 *
 *               limit:
 *                 type: integer
 *                 example: 10
 *
 *     responses:
 *       200:
 *         description: Filtered news list
 *
 *       400:
 *         description: Invalid input
 */
router.post("/filter", getNewsByBody);

/* Protected */
/* PROTECTED + AUTHORIZED */
/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Create a news article (with optional image)
 *     description: |
 *       Creates a new news article.
 *       Only users with **Editor** or **Admin** role are allowed.
 *
 *       🔐 Authentication:
 *       - Supports BOTH:
 *         • HTTP-only cookie (accessToken)
 *         • Authorization header (Bearer token)
 *
 *       📌 Notes:
 *       - Image upload is optional
 *       - If `isPublished` is true, `publishedAt` is set automatically
 *
 *     tags: [News]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: Artificial Intelligence Is Transforming Software
 *               content:
 *                 type: string
 *                 example: AI is changing how modern software is built and deployed.
 *               category:
 *                 type: string
 *                 enum:
 *                   - politics
 *                   - sports
 *                   - technology
 *                   - business
 *                   - health
 *                   - entertainment
 *                 example: technology
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *               image:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       201:
 *         description: News created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: News created successfully
 *                 data:
 *                   $ref: '#/components/schemas/News'
 *
 *       400:
 *         description: Validation error (missing required fields)
 *
 *       401:
 *         description: Unauthorized (token missing or invalid)
 *
 *       403:
 *         description: Forbidden (Editor or Admin access required)
 */


router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "editor"),
  upload.single("image"),
  createNews,
);

/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     summary: Update a news article (optionally replace image)
 *     tags: [News]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [sports, technology, business, politics, health]
 *               isPublished:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: News updated successfully
 *       400:
 *         description: Invalid category
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: News not found
 */

router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "editor"),
  upload.single("image"),
  updateNews,
);

/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     summary: Delete a news article and its image (Admin only)
 *     description: >
 *       Deletes a news article by ID.
 *       If the news has an associated image, the image is also deleted from Cloudinary.
 *     tags: [News]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the news article
 *     responses:
 *       200:
 *         description: News and image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: News and image deleted successfully
 *       401:
 *         description: Unauthorized (access token missing or invalid)
 *       403:
 *         description: Forbidden (admin role required)
 *       404:
 *         description: News not found
 */

router.delete("/:id", authenticate, authorizeRoles("admin"), deleteNews);

export default router;
