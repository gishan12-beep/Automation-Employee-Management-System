import jwt from "jsonwebtoken";

/**
 * EXISTING requireAuth (UNCHANGED)
 */
export const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { user_id, role, employee_id }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 *  NEW: Role-based access control
 * Usage: requireRole("MANAGER") or requireRole("MANAGER","ACCOUNTANT")
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const role = (req.user?.role || "").toUpperCase();
    const allowed = allowedRoles.map((r) => String(r).toUpperCase());
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};
