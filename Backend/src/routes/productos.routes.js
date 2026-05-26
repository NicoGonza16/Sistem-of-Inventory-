const express = require("express");
const controller = require("../controllers/productos.controller");
const productoImagenController = require("../controllers/productoImagen.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyAdmin } = require("../middlewares/role.middleware");
const { productImageUpload } = require("../middlewares/upload.middleware");

const router = express.Router();

router.use(verifyToken);
router.get("/", controller.getAllProductos);
router.post("/", controller.createProducto);
router.get("/:id/imagenes", productoImagenController.getProductoImagenes);
router.post("/:id/imagenes", productImageUpload.array("imagenes", 8), productoImagenController.uploadProductoImagenes);
router.put("/imagenes/:imageId", productImageUpload.single("imagen"), productoImagenController.updateProductoImagen);
router.delete("/imagenes/:imageId", verifyAdmin, productoImagenController.deleteProductoImagen);
router.get("/:id", controller.getProductoById);
router.put("/:id", controller.updateProducto);
router.delete("/:id", verifyAdmin, controller.deleteProducto);

module.exports = router;
