import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import managerEmployeeRoutes from "./routes/managerEmployeeRoutes.js";
import passwordResetRoutes from "./routes/passwordReset.routes.js"; // ✅ NEW

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordResetRoutes); // ✅ NEW
app.use("/api/manager", managerEmployeeRoutes);

export default app;
