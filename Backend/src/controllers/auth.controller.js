const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sanitizeUsuario } = require("../utils/sanitize");

const login = asyncHandler(async (req, res) => {
  const { usuario } = req.body;
  const contrasena = req.body.contrasena || req.body["contraseña"];

  if (!usuario || !contrasena) {
    throw new AppError("Usuario y contraseña son obligatorios.", 400);
  }

  const existingUser = await prisma.usuario.findFirst({
    where: {
      usuario: {
        equals: usuario,
        mode: "insensitive",
      },
      estado: true,
      deleted_at: null,
    },
  });

  if (!existingUser) {
    throw new AppError("Credenciales inválidas.", 401);
  }

  let isMatch = false;

  if (existingUser.contrasena?.startsWith("$2")) {
    isMatch = await bcrypt.compare(contrasena, existingUser.contrasena);
  } else {
    isMatch = existingUser.contrasena === contrasena;

    if (isMatch) {
      const hashedPassword = await bcrypt.hash(contrasena, 10);

      await prisma.usuario.update({
        where: { id_usuario: existingUser.id_usuario },
        data: { contrasena: hashedPassword },
      });

      existingUser.contrasena = hashedPassword;
    }
  }

  if (!isMatch) {
    throw new AppError("Credenciales inválidas.", 401);
  }

  const token = jwt.sign(
    {
      id_usuario: existingUser.id_usuario,
      rol: existingUser.rol,
      usuario: existingUser.usuario,
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  const safeUser = sanitizeUsuario(existingUser);

  res.status(200).json({
    success: true,
    message: "Inicio de sesión exitoso.",
    token,
    user: safeUser,
    data: {
      token,
      user: safeUser,
      usuario: safeUser,
    },
  });
});

const profile = asyncHandler(async (req, res) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: req.user.id_usuario },
  });

  const safeUser = sanitizeUsuario(usuario);

  res.status(200).json({
    success: true,
    message: "Perfil obtenido correctamente.",
    user: safeUser,
    data: safeUser,
  });
});

module.exports = {
  login,
  profile,
};
