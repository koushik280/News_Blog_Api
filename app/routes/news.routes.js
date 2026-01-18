import express from "express";
import {
  getNews,
  createNews,
  updateNews,
  deleteNews,
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
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: News fetched successfully
 */
/* Public */
router.get("/", getNews);

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
