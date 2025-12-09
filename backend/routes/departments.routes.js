const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");

const ctrl = require("../controllers/departments.controller");

router.get("/", verifyToken, ctrl.getDepartments);
router.post("/", verifyToken, ctrl.addDepartment);
router.put("/:id", verifyToken, ctrl.updateDepartment);
router.delete("/:id", verifyToken, ctrl.deleteDepartment);

module.exports = router;
