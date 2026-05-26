const express = require("express");
const { login, profile } = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/login", login);
router.get("/me", verifyToken, profile);

module.exports = router;
