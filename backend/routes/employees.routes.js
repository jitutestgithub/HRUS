const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/auth");
const controller = require("../controllers/employees.controller");

// Get all employees
router.get("/", verifyToken, controller.getEmployees);

// Add employee
router.post("/", verifyToken, controller.addEmployee);

// Get employee by ID
router.get("/:id", verifyToken, controller.getEmployeeById);

// Update employee by ID
router.put("/:id", verifyToken, controller.updateEmployee);

// Delete employee by ID
router.delete("/:id", verifyToken, controller.deleteEmployee);

module.exports = router;
