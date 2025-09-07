
const express = require("express");
const publicController = require("../controllers/publicController");
const { optionalAuth } = require("../middleware/auth");
const { ObjectStorageService } = require("../objectStorage");

const router = express.Router();

// Public routes that don't require authentication

// =======================
// PUBLIC JOB DATA
// =======================

// Get public job statistics
router.get("/stats", publicController.getStats);

// Get all cities
router.get("/cities", publicController.getCities);

// Get featured/popular jobs for landing page
router.get("/jobs/featured", publicController.getFeaturedJobs);

// Get job categories with counts
router.get("/categories", publicController.getCategories);

// Get education qualifications
router.get("/education-qualifications", publicController.getEducationQualifications);

// Get job roles
router.get("/job-roles", publicController.getJobRoles);

// Search jobs (public endpoint with limited info)
router.get("/jobs/search", optionalAuth, publicController.searchJobs);

// Get single job by ID for candidates with status info
router.get("/candidates/jobs/:id", optionalAuth, publicController.getCandidateJobById);

// Get single job by ID (public endpoint) - MUST be after /jobs/search
router.get("/jobs/:id", optionalAuth, publicController.getJobById);

// Get job preview by ID (for DRAFT and PENDING_APPROVAL jobs) - MUST be after /jobs/search
router.get("/jobs/:id/preview", optionalAuth, publicController.getJobPreview);

// Get testimonials/reviews (mock data for now)
router.get("/testimonials", publicController.getTestimonials);

// =======================
// PUBLIC COMPANY DATA
// =======================

// Get companies with filtering and pagination
router.get("/companies", publicController.getCompanies);

// =======================
// PUBLIC CANDIDATE DATA
// =======================

// Get public candidate profile
router.get("/candidates/:candidateId/profile", optionalAuth, publicController.getCandidateProfile);

// Serve profile images
router.get("/images/profiles/:userId/:fileName", async (req, res) => {
  try {
    const { userId, fileName } = req.params;
    const filePath = `profiles/${userId}/${fileName}`;

    const objectStorageService = new ObjectStorageService();
    const file = objectStorageService.bucket.file(filePath);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Get file metadata for proper content type
    const [metadata] = await file.getMetadata();

    // Set appropriate headers
    res.set({
      "Content-Type": metadata.contentType || "image/jpeg",
      "Cache-Control": "public, max-age=86400", // Cache for 1 day
      "Content-Length": metadata.size,
    });

    // Stream the file
    const stream = file.createReadStream();

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error streaming file" });
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error("Error serving profile image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve cover images
router.get("/images/covers/:userId/:fileName", async (req, res) => {
  try {
    const { userId, fileName } = req.params;
    const filePath = `covers/${userId}/${fileName}`;

    const objectStorageService = new ObjectStorageService();
    const file = objectStorageService.bucket.file(filePath);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Get file metadata for proper content type
    const [metadata] = await file.getMetadata();

    // Set appropriate headers
    res.set({
      "Content-Type": metadata.contentType || "image/jpeg",
      "Cache-Control": "public, max-age=86400", // Cache for 1 day
      "Content-Length": metadata.size,
    });

    // Stream the file
    const stream = file.createReadStream();

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error streaming file" });
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error("Error serving cover image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve resume files
router.get("/files/resumes/:userId/:fileName", async (req, res) => {
  try {
    const { userId, fileName } = req.params;
    const filePath = `resumes/${userId}/${fileName}`;

    const objectStorageService = new ObjectStorageService();
    const file = objectStorageService.bucket.file(filePath);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Get file metadata
    const [metadata] = await file.getMetadata();

    // Set appropriate headers for PDF download
    res.set({
      "Content-Type": metadata.contentType || "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "private, max-age=3600", // Cache for 1 hour, private for resumes
      "Content-Length": metadata.size,
    });

    // Stream the file
    const stream = file.createReadStream();

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error streaming file" });
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error("Error serving resume:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get skills
router.get("/skills", publicController.getSkills);

module.exports = router;
