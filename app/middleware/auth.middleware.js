import { verifyAccessToken } from "../services/token.service.js";

export const authenticate = (req, res, next) => {
  let token = null;

  // 1️⃣ Check Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2️⃣ Fallback to cookie
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  // ❌ No token found
  if (!token) {
    return res.status(401).json({
      message: "Access token missing",
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { userId, role }
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
};
