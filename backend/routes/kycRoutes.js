const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadKyc } = require("../controllers/kycController");

const router = express.Router();

// ------------------------
// MULTER STORAGE SETUP
// ------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // folder
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Middleware
const upload = multer({ storage });

// ------------------------
// ROUTE
// ------------------------
router.post(
  "/upload",
  upload.fields([
    { name: "aadhar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "bank_passbook", maxCount: 1 },
  ]),
  uploadKyc
);

module.exports = router;
