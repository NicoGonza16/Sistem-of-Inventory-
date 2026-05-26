const express = require("express");
const controller = require("../controllers/usuarios.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyAdmin } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(verifyToken, verifyAdmin);
router.get("/", controller.getAllUsuarios);
router.get("/:id", controller.getUsuarioById);
router.post("/", controller.createUsuario);
router.put("/:id", controller.updateUsuario);
router.delete("/:id", controller.deleteUsuario);

module.exports = router;
