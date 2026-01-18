/**
 * Restrict access based on user role
 * @param {...string} allowedRoles
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is already attached by authenticate middleware
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action"
      });
    }

    next();
  };
};
