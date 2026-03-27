import express from "express";
import  {getPublicCategories}  from "../controller/PublicCategory.controller.js";

const router = express.Router();
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all active categories (Public)
 *     description: |
 *       Returns all active categories.
 *       Used by frontend to populate category dropdowns and filters.
 *
 *       🔓 Public API (No authentication required)
 *
 *     tags: [Category (Public)]
 *
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *
 *       500:
 *         description: Internal server error
 */
router.get("/categories", getPublicCategories);

export default router;
