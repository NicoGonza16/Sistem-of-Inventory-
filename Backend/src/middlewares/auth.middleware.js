const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const AppError = require("../utils/appError");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Token no proporcionado.", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await prisma.usuario.findFirst({
      where: {
        id_usuario: decoded.id_usuario,
        estado: true,
        deleted_at: null,
      },
    });

    if (!usuario) {
      throw new AppError("Usuario no autorizado.", 401);
    }

    req.user = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      rol: usuario.rol,
    };

    next();
  } catch (error) {
    next(error.name === "JsonWebTokenError" || error.name === "TokenExpiredError"
      ? new AppError("JWT inválido o expirado.", 401)
      : error);
  }
};

module.exports = {
  verifyToken,
};
