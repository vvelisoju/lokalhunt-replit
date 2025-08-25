require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const {
  ObjectStorageService,
  ObjectNotFoundError,
} = require("./objectStorage");

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const prisma = new PrismaClient();

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully`);

  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
    });
  }

  try {
    await prisma.$disconnect();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }

  process.exit(0);
};

// Register shutdown handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Comprehensive CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
    "http://localhost:8081", // Expo web
    "https://lokalhunt.com",
    "https://www.lokalhunt.com",
  ];

  // Allow all Replit domains
  const isReplitDomain = origin && origin.includes(".replit.dev");

  if (allowedOrigins.includes(origin) || !origin || isReplitDomain) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma",
  );
  res.header("Access-Control-Expose-Headers", "Content-Length,Content-Range");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Fallback CORS for debugging
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("CORS origin check:", origin);
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    optionsSuccessStatus: 200,
  }),
);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoints
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "LokalHunt API Server",
    version: "1.0.0",
    environment: NODE_ENV,
    database: "connected",
    timestamp: new Date().toISOString(),
    platform: "Replit",
  });
});

app.get("/health", async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// API status endpoint
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Lokalhunt API is running",
    data: {
      version: process.env.API_VERSION || "v1",
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
      platform: "Lokalhunt - Your city, your career",
      endpoints: {
        auth: "/api/auth",
        profile: "/api/profile",
        candidates: "/api/candidates",
        employers: "/api/employers",
        branchAdmins: "/api/branch-admins",
        ads: "/api/ads",
        public: "/api/public",
        shared: "/api/shared",
        ai: "/api/ai",
        health: "/health",
      },
    },
  });
});

// Import routes
const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const employerRoutes = require("./routes/employerRoutes");
const branchAdminRoutes = require("./routes/branchAdminRoutes");
const adRoutes = require("./routes/adRoutes");
const publicRoutes = require("./routes/publicRoutes");
const aiRoutes = require("./routes/aiRoutes");
const profileRoutes = require("./routes/profileRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const sharedRoutes = require("./routes/sharedRoutes"); // Import shared routes

// Use routes - mounted under /api to match client expectations
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/employers", employerRoutes);
app.use("/api/branch-admins", branchAdminRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/shared", sharedRoutes); // Use shared routes

// Object storage serving routes
app.get("/objects/:objectPath(*)", async (req, res) => {
  try {
    const objectStorageService = new ObjectStorageService();
    const objectFile = await objectStorageService.getObjectEntityFile(req.path);

    // For profile photos and resumes, allow public access
    objectStorageService.downloadObject(objectFile, res);
  } catch (error) {
    console.error("Error serving object:", error);
    if (error instanceof ObjectNotFoundError) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error serving file",
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Prisma specific errors
  if (error.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "A record with this information already exists",
      code: "DUPLICATE_ENTRY",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found",
      code: "NOT_FOUND",
    });
  }

  if (error.code === "P2003") {
    return res.status(400).json({
      success: false,
      message: "Invalid reference - related record not found",
      code: "FOREIGN_KEY_CONSTRAINT",
    });
  }

  if (error.code === "P2014") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID provided",
      code: "INVALID_ID",
    });
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
      code: "INVALID_TOKEN",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Authentication token has expired",
      code: "TOKEN_EXPIRED",
    });
  }

  // Validation errors
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details: error.message,
    });
  }

  // Syntax errors
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format in request body",
      code: "INVALID_JSON",
    });
  }

  // Default error response
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message: message,
    code: "INTERNAL_ERROR",
    ...(NODE_ENV === "development" && {
      stack: error.stack,
      details: error,
    }),
  });
});

// 404 handler for unmatched routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    code: "ROUTE_NOT_FOUND",
    availableEndpoints: {
      auth: "/api/auth",
      profile: "/api/profile",
      candidates: "/api/candidates",
      employers: "/api/employers",
      branchAdmins: "/api/branch-admins",
      ads: "/api/ads",
      public: "/api/public",
      shared: "/api/shared",
      ai: "/api/ai",
      health: "/health",
    },
  });
});

// Start server
const server = app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 LokalHunt API Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log("📊 Database: Connected");
  console.log("🔐 Authentication: Enabled");
  console.log("🌐 CORS: Configured for frontend");
  console.log(`⏰ Started at: ${new Date().toISOString()}`);

  // Test database connection on startup
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection verified");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

module.exports = app;