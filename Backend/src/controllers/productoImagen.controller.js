const fs = require("fs/promises");
const path = require("path");
const prisma = require("../config/database");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");

const fileUrlFromName = (filename) =>
  `/uploads/productos/${filename}`;

const absolutePathFromUrl = (urlImagen) => {
  const normalized = urlImagen.replace(/^\/+/, "");
  return path.join(process.cwd(), normalized);
};

const getProductoImagenes = asyncHandler(async (req, res) => {
  const idProducto = Number(req.params.id);

  const producto = await prisma.producto.findFirst({
    where: {
      id_producto: idProducto,
      deleted_at: null,
    },
    include: {
      imagenes: {
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!producto) {
    throw new AppError("Producto no encontrado.", 404);
  }

  sendResponse(
    res,
    200,
    "Imágenes obtenidas correctamente.",
    producto.imagenes
  );
});

const uploadProductoImagenes = asyncHandler(async (req, res) => {
  console.log("=================================");
  console.log("===== SUBIDA DE IMAGEN =====");
  console.log("PARAMS:", req.params);
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);
  console.log("=================================");

  const idProducto = Number(req.params.id);
  const files = req.files || [];

  if (!files.length) {
    throw new AppError(
      "Debes seleccionar al menos una imagen.",
      400
    );
  }

  console.log("CANTIDAD DE ARCHIVOS:", files.length);

  files.forEach((file, index) => {
    console.log(`ARCHIVO ${index + 1}:`);
    console.log({
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      destination: file.destination,
      filename: file.filename,
      path: file.path,
      size: file.size,
    });
  });

  const producto = await prisma.producto.findFirst({
    where: {
      id_producto: idProducto,
      deleted_at: null,
    },
  });

  if (!producto) {
    throw new AppError(
      "Producto no encontrado.",
      404
    );
  }

  const createdImages = await prisma.$transaction(
    files.map((file) => {
      console.log(
        "GUARDANDO EN BD:",
        file.filename
      );

      return prisma.productoImagen.create({
        data: {
          id_producto: idProducto,
          url_imagen: fileUrlFromName(
            file.filename
          ),
        },
      });
    })
  );

  console.log("IMAGENES GUARDADAS:");
  console.log(createdImages);

  sendResponse(
    res,
    201,
    "Imágenes subidas correctamente.",
    createdImages
  );
});

const updateProductoImagen = asyncHandler(async (req, res) => {
  const idImagen = Number(req.params.imageId);
  const file = req.file;

  console.log("===== ACTUALIZAR IMAGEN =====");
  console.log("FILE:", file);

  if (!file) {
    throw new AppError(
      "Debes seleccionar una imagen para actualizar.",
      400
    );
  }

  const existingImage =
    await prisma.productoImagen.findUnique({
      where: {
        id_imagen: idImagen,
      },
    });

  if (!existingImage) {
    throw new AppError(
      "Imagen no encontrada.",
      404
    );
  }

  const updatedImage =
    await prisma.productoImagen.update({
      where: {
        id_imagen: idImagen,
      },
      data: {
        url_imagen: fileUrlFromName(
          file.filename
        ),
      },
    });

  await fs
    .unlink(
      absolutePathFromUrl(
        existingImage.url_imagen
      )
    )
    .catch(() => null);

  sendResponse(
    res,
    200,
    "Imagen actualizada correctamente.",
    updatedImage
  );
});

const deleteProductoImagen = asyncHandler(async (req, res) => {
  const idImagen = Number(req.params.imageId);

  const existingImage =
    await prisma.productoImagen.findUnique({
      where: {
        id_imagen: idImagen,
      },
    });

  if (!existingImage) {
    throw new AppError(
      "Imagen no encontrada.",
      404
    );
  }

  await prisma.productoImagen.delete({
    where: {
      id_imagen: idImagen,
    },
  });

  await fs
    .unlink(
      absolutePathFromUrl(
        existingImage.url_imagen
      )
    )
    .catch(() => null);

  sendResponse(
    res,
    200,
    "Imagen eliminada correctamente.",
    existingImage
  );
});

module.exports = {
  getProductoImagenes,
  uploadProductoImagenes,
  updateProductoImagen,
  deleteProductoImagen,
};