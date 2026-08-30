import express, {type Express, type Request, type Response,} from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.config.js";
import { authRouter } from "./modules/auth/index.js";
import { userRoutes } from "./modules/users/index.js";
import { candidateRouter } from "./modules/candidates/index.js";
import { companyRouter, employerProfileRouter, employerRouter } from "./modules/companies/index.js";
import { skillRouter } from "./modules/skills/index.js";
import { jobRouter } from "./modules/jobs/index.js";
import { jobApplicationRoutes } from "./modules/jobApplication/index.js";
import { adminRoutes } from "./modules/admin/index.js";
import { notificationsRouter } from "./modules/notifications/index.js";
import { contactRouter } from "./modules/contact/index.js";
import { bookmarksRouter } from "./modules/bookmarks/index.js";

import { globalErrorHandler } from "./middlewares/error.middleware.js";

// Security middleware

export const app: Express = express();

app.use(helmet());

const allowedOrigins = env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map((o) => o.trim()) : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:(3000|3001|3002|5173)$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow in development
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes

app.use("/auth", authRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/candidate", candidateRouter);
app.use("/api/v1/companies", companyRouter);
app.use("/api/v1/employer-profile", employerProfileRouter);
app.use("/api/v1/employer", employerRouter);
app.use("/api/v1/skills", skillRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/job-applications", jobApplicationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/bookmarks", bookmarksRouter);


// Global Error Handler

app.use(globalErrorHandler);