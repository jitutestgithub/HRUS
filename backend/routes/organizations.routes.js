const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/auth");
const controller = require("../controllers/organizations.controller");

// Logged-in user's organization
router.get("/me", verifyToken, controller.getMyOrganization);
router.put("/me", verifyToken, controller.updateMyOrganization);

// Superadmin: list all orgs
router.get("/", verifyToken, controller.getOrganizations);

// Superadmin: create new org
router.post("/", verifyToken, controller.createOrganization);

module.exports = router;
