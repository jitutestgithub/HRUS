const express = require("express");
const router = express.Router();

const { verifyToken } = require("../../middlewares/auth");
const leaves = require("../../controllers/employee/leaves.controller");

// Employee
router.post("/apply", verifyToken, leaves.applyLeave);
router.get("/my", verifyToken, leaves.myLeaves);

// Admin
router.get("/admin", verifyToken, leaves.adminList);
router.put("/status/:id", verifyToken, leaves.updateStatus);



module.exports = router;
