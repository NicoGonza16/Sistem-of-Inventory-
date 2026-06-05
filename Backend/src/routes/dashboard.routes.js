const express = require("express");
const {
  getDashboard,
} = require("../controllers/dashboard.controller");

const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", verifyToken, getDashboard);

module.exports = router;