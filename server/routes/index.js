const express = require("express");
const authRoutes = require("./authRoutes");
const candidateRoutes = require("./candidateRoutes");
const employerRoutes = require("./employerRoutes");
const branchAdminRoutes = require("./branchAdminRoutes");
const adRoutes = require("./adRoutes");
const publicRoutes = require("./publicRoutes");
const sharedRoutes = require("./sharedRoutes");
const aiRoutes = require("./aiRoutes");
const profileRoutes = require("./profileRoutes");
const emailRoutes = require("./emailRoutes");
const subscriptionRoutes = require("./subscriptionRoutes");
const notificationRoutes = require("./notificationRoutes");
const { createResponse } = require("../utils/response");

const router = express.Router();

// API Info endpoint
router.get("/", (req, res) => {
  res.json(
    createResponse("Lokalhunt API is running", {
      version: process.env.API_VERSION || "v1",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      platform: "Lokalhunt - Your city, your career",
      endpoints: {
        auth: "/api/auth",
        ads: "/api/ads",
        candidate: "/api/candidate",
        employer: "/api/employers",
        branchAdmin: "/api/branch-admins",
        profile: "/api/profile",
        shared: "/api/shared",
        health: "/health",
        ai: "/api/ai",
        email: "/api/email",
      },
    }),
  );
});

// Routes
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);

// // Debug middleware for candidate routes
// router.use("/candidate", (req, res, next) => {
//   console.log(`Candidate API accessed: ${req.method} /api/candidate${req.path}`);
//   next();
// });

router.use("/candidate", candidateRoutes);
router.use("/employers", employerRoutes);
router.use("/branch-admins", branchAdminRoutes);
router.use("/ads", adRoutes);
router.use("/public", publicRoutes);
router.use("/shared", sharedRoutes);
router.use("/ai", aiRoutes);
router.use("/email", emailRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;
