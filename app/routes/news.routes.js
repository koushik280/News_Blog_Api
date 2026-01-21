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
 *     summary: Get news (all, single, category, pagination)
 *     description: |
 *       This single endpoint handles multiple use cases:
 *
 *       🔹 Get all news
 *       🔹 Get single news by **id**
 *       🔹 Get single news by **slug**
 *       🔹 Filter news by **category**
 *       🔹 Optional pagination
 *
 *       📌 Examples:
 *       - All news: `/api/news`
 *       - Single by ID: `/api/news?id=NEWS_ID`
 *       - Single by slug: `/api/news?slug=news-slug`
 *       - Category only: `/api/news?category=sports`
 *       - Category + pagination: `/api/news?category=sports&page=1&limit=5`
 *       - Pagination only: `/api/news?page=1&limit=10`
 *
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId (fetch single news)
 *
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
 *         description: SEO-friendly slug (fetch single news)
 *
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [sports, technology, business, politics, health]
 *         description: Filter news by category
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
 *       404:
 *         description: News not found
 */

/**
 * @swagger
 * /api/news/filter:
 *   post:
 *     summary: Get news using filters and pagination (payload-based)
 *     description: |
 *       This endpoint allows fetching news using request **payload** instead of query parameters.
 *       It is useful when frontend needs to send pagination, category, or filters in the request body.
 *
 *       🔹 Supported features:
 *       - Get all news
 *       - Filter by category
 *       - Fetch single news by id or slug
 *       - Optional pagination
 *
 *       📌 Examples:
 *       - All news: `{ }`
 *       - Category only: `{ "category": "sports" }`
 *       - Pagination: `{ "page": 1, "limit": 5 }`
 *       - Category + pagination:
 *         `{ "category": "sports", "page": 1, "limit": 5 }`
 *
 *     tags: [News]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: MongoDB ObjectId (fetch single news)
 *               slug:
 *                 type: string
 *                 description: SEO-friendly slug (fetch single news)
 *               category:
 *                 type: string
 *                 enum: [sports, technology, business, politics, health]
 *                 description: Filter news by category
 *               page:
 *                 type: integer
 *                 example: 1
 *                 description: Page number for pagination (optional)
 *               limit:
 *                 type: integer
 *                 example: 10
 *                 description: Number of results per page (optional)
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
 *                   nullable: true
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalResults:
 *                       type: integer
 *       404:
 *         description: News not found
 */

router.get("/", getNews);



router.post("/filter", getNewsByBody);


/* Protected */
/* PROTECTED + AUTHORIZED */
/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Create a news article with image
 *     tags: [News]
 *     security:
 *       - cookieAuth: []
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
 *                 example: India wins series
 *               content:
 *                 type: string
 *                 example: India won the series in a thrilling match.
 *               category:
 *                 type: string
 *                 enum: [politics, sports, technology, business, health, entertainment]
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: News created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
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
