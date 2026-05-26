const express = require("express");
const controller = require("../controllers/categorias.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyAdmin } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(verifyToken);
router.get("/", controller.getAllCategorias);
router.get("/:id", controller.getCategoriaById);
router.post("/", controller.createCategoria);
router.put("/:id", controller.updateCategoria);
router.delete("/:id", verifyAdmin, controller.deleteCategoria);

module.exports = router;
