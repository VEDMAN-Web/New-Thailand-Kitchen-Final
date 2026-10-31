const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { UPLOAD_ROOT, ensureUploadDirs } = require("./config/upload");

const app = express();
ensureUploadDirs();

function parseOrigins(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const allowedOrigins = [
  ...parseOrigins(process.env.CORS_ORIGINS),
  ...parseOrigins(process.env.ADMIN_URL),
  ...parseOrigins(process.env.CLIENT_URL),
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser / same-origin tools (no Origin header)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      // Dev fallback: allow any localhost origin
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      // Production: reject unknown origins when CORS_ORIGINS / CLIENT_URL / ADMIN_URL are set
      if (
        process.env.NODE_ENV === "production" &&
        (process.env.CORS_ORIGINS ||
          process.env.CLIENT_URL ||
          process.env.ADMIN_URL)
      ) {
        return callback(new Error(`CORS blocked for origin: ${origin}`), false);
      }
      // Local / unset-env multi-host deploys stay permissive
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("dev"));

// Public uploaded media (images, icons, PDFs)
app.use("/uploads", express.static(UPLOAD_ROOT));

app.get("/api/health", (_req, res) => {
  const mongoose = require("mongoose");
  res.json({
    success: true,
    message: "API OK",
    env: process.env.APP_ENV || process.env.NODE_ENV || "development",
    database: mongoose.connection?.name || process.env.MONGO_DB_NAME || "",
  });
});

const contactRouter = require("./router/contactRouter");
const authRouter = require("./router/authRouter");
const cmsRouter = require("./router/cmsRouter");
const uploadRouter = require("./router/uploadRouter");
const errorHandler = require("./middleware/errorMiddleware");

app.use("/api/contact", contactRouter);
app.use("/api/auth", authRouter);
app.use("/api/cms", cmsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/uploads", uploadRouter);
app.use("/upload", uploadRouter);

app.use(errorHandler);

module.exports = app;
