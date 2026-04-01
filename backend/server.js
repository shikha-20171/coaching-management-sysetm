import cors from "cors";
import express from "express";
import "./config/loadEnv.js";

import aiRoutes from "./routes/ai.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import authRoutes from "./routes/auth.routes.js";
import batchRoutes from "./routes/batch.routes.js";
import courseRoutes from "./routes/course.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import feesRoutes from "./routes/fees.routes.js";
import instituteRoutes from "./routes/institute.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reportRoutes from "./routes/report.routes.js";
import studentRoutes from "./routes/student.routes.js";
import testRoutes from "./routes/test.routes.js";
import userRoutes from "./routes/user.routes.js";
import { verifyToken } from "./middleware/auth.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/students", verifyToken, studentRoutes);
app.use("/api/institutes", verifyToken, instituteRoutes);
app.use("/api/courses", verifyToken, courseRoutes);
app.use("/api/batches", verifyToken, batchRoutes);
app.use("/api/fees", verifyToken, feesRoutes);
app.use("/api/attendance", verifyToken, attendanceRoutes);
app.use("/api/tests", verifyToken, testRoutes);
app.use("/api/notifications", verifyToken, notificationRoutes);
app.use("/api/ai", verifyToken, aiRoutes);
app.use("/api/dashboard", verifyToken, dashboardRoutes);
app.use("/api/user", verifyToken, userRoutes);
app.use("/api/reports", verifyToken, reportRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", date: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.send("Coaching Management Backend Running");
});

const isVercelRuntime = process.env.VERCEL === "1" || process.env.VERCEL === "true";

if (!isVercelRuntime) {
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });

  server.on("error", (error) => {
    console.error("Failed to start backend server:", error.message);
    process.exit(1);
  });
}

export default app;
