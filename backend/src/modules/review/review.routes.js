const express = require("express");
const router = express.Router();
const controller = require("./review.controller");
const ensureAuth = require("../../middlewares/ensureAuth");
const ensureAdmin = require("../../middlewares/ensureAdmin");

// ===== Customer routes =====
// All customer routes are protected by ensureAuth (applied in server.js)
router.post("/", controller.createReview); // POST /api/reviews
router.get("/my-reviews", controller.getMyReviews); // GET /api/reviews/my-reviews

// ===== Admin routes =====
// These will be mounted at /api/admin/reviews with ensureAdmin already applied in server.js
router.get("/", controller.getAllReviews); // GET /api/admin/reviews
router.get("/:id", controller.getReviewById); // GET /api/admin/reviews/:id
router.delete("/:id", controller.deleteReview); // DELETE /api/admin/reviews/:id

module.exports = router;
