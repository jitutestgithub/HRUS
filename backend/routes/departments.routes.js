const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/auth");
const controller = require("../controllers/departments.controller");

// IMPORTANT: Both controller functions must exist!
router.get("/", verifyToken, controller.getDepartments);
router.post("/", verifyToken, controller.addDepartment);

module.exports = router;
