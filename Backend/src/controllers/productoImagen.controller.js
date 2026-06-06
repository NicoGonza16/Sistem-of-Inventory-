const prisma = require("../config/database");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

/**
 * OBTENER IMÁGENES DE UN PRODUCTO
 */
const getProductoImagenes = asyncHandler(async (req, res) => {
  const idProducto = Number(req.params.id);

  const producto = await prisma.producto.findFirst({
    where: {
      id_producto: idProducto,
      deleted_at: null,
    },
    include: {
      imagenes: {
        orderBy: {
          created_at: "desc",
        },
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

/**
 * SUBIR IMÁGENES DE UN PRODUCTO
 */
const uploadProductoImagenes = asyncHandler(async (req, res) => {
  const idProducto = Number(req.params.id);
  const files = req.files || [];

  if (!files.length) {
    throw new AppError("Debes seleccionar al menos una imagen.", 400);
  }

  const producto = await prisma.producto.findFirst({
    where: {
      id_producto: idProducto,
      deleted_at: null,
    },
  });

  if (!producto) {
    throw new AppError("Producto no encontrado.", 404);
  }

  const uploadedImages = [];

  for (const file of files) {
    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "productos",
            resource_type: "image",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

      const newImage = await prisma.productoImagen.create({
        data: {
          id_producto: idProducto,
          url_imagen: result.secure_url,
        },
      });

      uploadedImages.push(newImage);
    } catch (error) {
      throw new AppError(
        error.message || "Error subiendo imagen a Cloudinary.",
        500
      );
    }
  }

  sendResponse(
    res,
    201,
    "Imágenes subidas correctamente.",
    uploadedImages
  );
});

/**
 * ACTUALIZAR IMAGEN
 */
const updateProductoImagen = asyncHandler(async (req, res) => {
  const idImagen = Number(req.params.imageId);
  const file = req.file;

  if (!file) {
    throw new AppError("Debes seleccionar una imagen para actualizar.", 400);
  }

  const existingImage = await prisma.productoImagen.findUnique({
    where: {
      id_imagen: idImagen,
    },
  });

  if (!existingImage) {
    throw new AppError("Imagen no encontrada.", 404);
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "productos",
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    const updatedImage = await prisma.productoImagen.update({
      where: {
        id_imagen: idImagen,
      },
      data: {
        url_imagen: result.secure_url,
      },
    });

    sendResponse(
      res,
      200,
      "Imagen actualizada correctamente.",
      updatedImage
    );
  } catch (error) {
    throw new AppError(
      error.message || "Error actualizando imagen.",
      500
    );
  }
});

/**
 * ELIMINAR IMAGEN
 */
const deleteProductoImagen = asyncHandler(async (req, res) => {
  const idImagen = Number(req.params.imageId);

  const existingImage = await prisma.productoImagen.findUnique({
    where: {
      id_imagen: idImagen,
    },
  });

  if (!existingImage) {
    throw new AppError("Imagen no encontrada.", 404);
  }

  await prisma.productoImagen.delete({
    where: {
      id_imagen: idImagen,
    },
  });

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