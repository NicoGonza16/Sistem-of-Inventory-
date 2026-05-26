const express = require("express");
const controller = require("../controllers/movimientos.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyAdmin } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(verifyToken);
router.get("/", controller.getAllMovimientos);
router.get("/:id", controller.getMovimientoById);
router.post("/", controller.createMovimiento);
router.put("/:id", controller.updateMovimiento);
router.delete("/:id", verifyAdmin, controller.deleteMovimiento);

module.exports = router;
