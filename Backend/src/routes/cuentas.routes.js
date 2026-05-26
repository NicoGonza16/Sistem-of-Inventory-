const express = require("express");
const controller = require("../controllers/cuentas.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyAdmin } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(verifyToken);
router.get("/", controller.getAllCuentas);
router.get("/:id", controller.getCuentaById);
router.post("/", controller.createCuenta);
router.put("/:id", controller.updateCuenta);
router.delete("/:id", verifyAdmin, controller.deleteCuenta);

module.exports = router;
