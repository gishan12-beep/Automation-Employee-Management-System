import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import managerEmployeeRoutes from "./routes/managerEmployeeRoutes.js";
import passwordResetRoutes from "./routes/passwordReset.routes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import managerAttendanceRoutes from "./routes/managerAttendanceRoutes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api/manager", managerEmployeeRoutes);
app.use("/api/manager", managerAttendanceRoutes);
app.use("/api/employee", employeeRoutes);

export default app;
