const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const ctrl = require("../controllers/employee.profile.controller");

// My Profile
router.get("/me", verifyToken, ctrl.getMyProfile);

// Update Profile
router.put("/update", verifyToken, ctrl.updateMyProfile);

// Change Password
router.put("/change-password", verifyToken, ctrl.changePassword);

router.put("/update-basic", verifyToken, ctrl.updateBasicInfo);
router.put("/update-address", verifyToken, ctrl.updateAddress);
router.put("/update-emergency", verifyToken, ctrl.updateEmergencyContact);


module.exports = router;
