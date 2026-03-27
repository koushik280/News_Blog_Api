import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controller/category.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Create a new category
 *     description: Admin can create a new category
 *     tags: [Category (Admin)]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Technology
 *               description:
 *                 type: string
 *                 example: News related to tech industry
 *
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post("/", authenticate, authorizeRoles("admin"), createCategory);
/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Get all categories (Admin)
 *     description: Returns all categories including inactive ones
 *     tags: [Category (Admin)]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
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
 */
router.get("/", authenticate, authorizeRoles("admin"), getCategories);
/**
 * @swagger
 * /api/admin/categories/{id}:
 *   get:
 *     summary: Get single category
 *     tags: [Category (Admin)]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *       404:
 *         description: Category not found
 */
router.get("/:id", authenticate, authorizeRoles("admin"), getCategoryById);
/**
 * @swagger
 * /api/admin/categories/{id}:
 *   patch:
 *     summary: Update category
 *     description: Admin can update name, description, or status
 *     tags: [Category (Admin)]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Business
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 example: true
 *
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 */
router.patch("/:id", authenticate, authorizeRoles("admin"), updateCategory);
/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     description: Deletes a category if not used in news
 *     tags: [Category (Admin)]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Category is used in news
 *       404:
 *         description: Category not found
 */
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteCategory);

export default router;

