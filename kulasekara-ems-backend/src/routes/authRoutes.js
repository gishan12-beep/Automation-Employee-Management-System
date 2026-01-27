import { Router } from "express";
import { login, me } from "../controllers/authController.js";
import { changePasswordFirstLogin } from "../controllers/passwordController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/change-password-first-login", requireAuth, changePasswordFirstLogin);

export default router;
