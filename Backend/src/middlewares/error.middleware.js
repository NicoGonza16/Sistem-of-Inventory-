const { Prisma } = require("@prisma/client");

const errorMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode || (error.name === "MulterError" ? 400 : 500);
  let message = error.message || "Error interno del servidor.";

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      message = "Ya existe un registro con un valor único duplicado.";
    }

    if (error.code === "P2025") {
      message = "El recurso solicitado no existe.";
    }
  }

  if (error.name === "MulterError") {
    message = "Error al procesar el archivo subido.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: error.data || null,
  });
};

module.exports = errorMiddleware;
