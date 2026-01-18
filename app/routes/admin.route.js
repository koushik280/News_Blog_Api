import express from "express";

import {
  updateUserRole,
  listUsers,
  deleteUser,
  disableUser,
  enableUser,
} from "../controller/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only user management APIs
 */

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Update a user's role (Admin only)
 *     description: >
 *       Allows an admin to change a user's role.
 *       Normal users cannot access this endpoint.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, editor, admin]
 *                 example: editor
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User role updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid role or self-role modification attempt
 *       401:
 *         description: Unauthorized (not logged in)
 *       403:
 *         description: Forbidden (admin access required)
 *       404:
 *         description: User not found
 */

router.patch(
  "/users/:id/role",
  authenticate,
  authorizeRoles("admin"),
  updateUserRole,
);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List users (Admin only)
 *     description: >
 *       Returns a paginated list of users.
 *       Admin can optionally filter users by role.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, editor, admin]
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Users fetched successfully
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin access required)
 */
router.get("/users", authenticate, authorizeRoles("admin"), listUsers);

/**
 * Admin-only: Delete user
 */

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     description: >
 *       Deletes a user by ID.
 *       Admin cannot delete their own account and
 *       the system must always have at least one admin.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Self-delete attempt or last admin protection
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin access required)
 *       404:
 *         description: User not found
 */

router.delete("/users/:id", authenticate, authorizeRoles("admin"), deleteUser);

/**
 * @swagger
 * /api/admin/users/{id}/disable:
 *   patch:
 *     summary: Disable a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User disabled successfully
 *       400:
 *         description: User already disabled or self-disable attempt
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch(
  "/users/:id/disable",
  authenticate,
  authorizeRoles("admin"),
  disableUser,
);

/**
 * @swagger
 * /api/admin/users/{id}/enable:
 *   patch:
 *     summary: Enable a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User enabled successfully
 *       400:
 *         description: User already active
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */

router.patch(
  "/users/:id/enable",
  authenticate,
  authorizeRoles("admin"),
  enableUser,
);

export default router;
