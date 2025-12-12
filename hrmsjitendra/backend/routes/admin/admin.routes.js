// const express = require("express");
// const router = express.Router();

// const { verifyToken } = require("../middlewares/auth");   // FIXED
// const controller = require("../controllers/admin.controller");

// // Protect admin stats
// router.get("/stats", verifyToken, controller.getStats);

// module.exports = router;


const express = require("express");
const router = express.Router();

const { verifyToken } = require("../../middlewares/auth.js");
const controller = require("../../controllers/admin/admin.controller");

// simple stats
router.get("/stats", verifyToken, controller.getStats);

// advanced full dashboard
router.get("/dashboard", verifyToken, controller.getDashboard);

module.exports = router;
