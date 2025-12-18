const express = require("express");
const router = express.Router();
const multer = require("multer");
const { verifyToken } = require("../../middlewares/auth");
const ctrl = require("../../controllers/employee/employee.upload.controller");

const storage = multer.diskStorage({
  destination: "uploads/profile",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload-photo", verifyToken, upload.single("photo"), ctrl.uploadPhoto);

module.exports = router;
