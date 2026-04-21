import jwt from "jsonwebtoken";

// Verifies the Bearer token in the Authorization header and attaches the user payload to the request object
export const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: "Missing token" });

    // Decode and verify the JWT using the secret key
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { user_id, role, employee_id }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Provides role-based access control by checking if the user's role matches any of the allowed roles
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const role = (req.user?.role || "").toUpperCase();
    const allowed = allowedRoles.map((r) => String(r).toUpperCase());
    
    // Check if the user's role exists within the set of allowed roles for this route
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};
