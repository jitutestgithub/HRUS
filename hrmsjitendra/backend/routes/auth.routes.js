const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");

const controller = require("../controllers/auth.controller");

router.post("/login", controller.login);
router.post("/register", controller.register);
router.get("/me", verifyToken, controller.me);

module.exports = router;
