import express from "express";
import {
  register,
  login,
  loginWithRefresh,
  refreshAccessToken,
  logout
} from "../controller/auth.controller.js";

const router = express.Router();
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */

router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and set access token in httpOnly cookie
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful (access token set in cookie)
 *       401:
 *         description: Invalid credentials
 */

router.post("/login", login);

/**
 * @swagger
 * /api/auth/login-with-refresh:
 *   post:
 *     summary: Login and set access & refresh tokens in httpOnly cookies
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful (cookies set)
 *       401:
 *         description: Invalid credentials
 */

router.post("/login-with-refresh", loginWithRefresh);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token cookie
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       401:
 *         description: Invalid or missing refresh token
 */

router.post("/refresh", refreshAccessToken);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user and clear auth cookies
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
 
router.post("/logout", logout);

export default router;
