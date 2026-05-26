const express = require("express");
const controller = require("../controllers/detalleCuenta.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyAdmin } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(verifyToken);
router.get("/", controller.getAllDetalles);
router.get("/:id", controller.getDetalleById);
router.post("/", controller.createDetalle);
router.put("/:id", controller.updateDetalle);
router.delete("/:id", verifyAdmin, controller.deleteDetalle);

module.exports = router;
