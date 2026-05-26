const express = require("express");
const controller = require("../controllers/mesas.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyAdmin } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(verifyToken);
router.get("/", controller.getAllMesas);
router.get("/:id", controller.getMesaById);
router.post("/", controller.createMesa);
router.put("/:id", controller.updateMesa);
router.delete("/:id", verifyAdmin, controller.deleteMesa);

module.exports = router;
