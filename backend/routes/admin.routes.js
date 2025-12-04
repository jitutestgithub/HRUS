const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/auth");   // FIXED
const controller = require("../controllers/admin.controller");

// Protect admin stats
router.get("/stats", verifyToken, controller.getStats);

module.exports = router;
