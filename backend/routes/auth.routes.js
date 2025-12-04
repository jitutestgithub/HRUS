const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");

const controller = require("../controllers/auth.controller");

router.post("/login", controller.login);
router.post("/register", controller.register);
router.get("/me", verifyToken, controller.me);
router.use("/employee", require("./employee.profile.routes.js"));

module.exports = router;
