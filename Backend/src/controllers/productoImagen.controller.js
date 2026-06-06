const prisma = require("../config/database");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

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

  const uploadedImages = [];

  for (const file of files) {
    try {
      console.log("SUBIENDO ARCHIVO:");
      console.log(file.originalname);
      console.log(file.mimetype);
      console.log(file.size);

      const result = await new Promise(
        (resolve, reject) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder: "productos",
                resource_type: "image",
              },
              (error, result) => {
                if (error) {
                  console.error(
                    "ERROR CLOUDINARY:"
                  );
                  console.error(error);

                  return reject(error);
                }

                console.log(
                  "RESPUESTA CLOUDINARY:"
                );
                console.log(result);

                resolve(result);
              }
            );

          streamifier
            .createReadStream(file.buffer)
            .pipe(uploadStream);
        }
      );

      console.log(
        "URL CLOUDINARY:",
        result.secure_url
      );

      const image =
        await prisma.productoImagen.create({
          data: {
            id_producto: idProducto,
            url_imagen: result.secure_url,
          },
        });

      uploadedImages.push(image);
    } catch (error) {
      console.error(
        "ERROR COMPLETO SUBIENDO IMAGEN:"
      );
      console.error(error);

      throw new AppError(
        error.message ||
          "Error subiendo imagen a Cloudinary.",
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

const updateProductoImagen = asyncHandler(async (req, res) => {
  const idImagen = Number(req.params.imageId);
  const file = req.file;

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

  try {
    const result = await new Promise(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder: "productos",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                return reject(error);
              }

              resolve(result);
            }
          );

        streamifier
          .createReadStream(file.buffer)
          .pipe(uploadStream);
      }
    );

    const updatedImage =
      await prisma.productoImagen.update({
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
    console.error(
      "ERROR ACTUALIZANDO IMAGEN:"
    );
    console.error(error);

    throw new AppError(
      error.message ||
        "Error actualizando imagen.",
      500
    );
  }
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
