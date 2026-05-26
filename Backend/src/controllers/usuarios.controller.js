const bcrypt = require("bcrypt");
const prisma = require("../config/database");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const { sanitizeUsuario } = require("../utils/sanitize");

const getAllUsuarios = asyncHandler(async (req, res) => {
  const usuarios = await prisma.usuario.findMany({
    where: { deleted_at: null },
    orderBy: { id_usuario: "asc" },
  });

  sendResponse(res, 200, "Usuarios obtenidos correctamente.", usuarios.map(sanitizeUsuario));
});

const getUsuarioById = asyncHandler(async (req, res) => {
  const usuario = await prisma.usuario.findFirst({
    where: {
      id_usuario: Number(req.params.id),
      deleted_at: null,
    },
  });

  if (!usuario) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  sendResponse(res, 200, "Usuario obtenido correctamente.", sanitizeUsuario(usuario));
});

const createUsuario = asyncHandler(async (req, res) => {
  const { nombre, usuario, contrasena, rol = "empleado", estado = true } = req.body;

  if (!nombre || !usuario || !contrasena) {
    throw new AppError("Nombre, usuario y contraseña son obligatorios.", 400);
  }

  const exists = await prisma.usuario.findFirst({
    where: { usuario },
  });

  if (exists) {
    throw new AppError("El nombre de usuario ya existe.", 409);
  }

  const hashedPassword = await bcrypt.hash(contrasena, 10);

  const newUser = await prisma.usuario.create({
    data: {
      nombre,
      usuario,
      contrasena: hashedPassword,
      rol,
      estado,
    },
  });

  sendResponse(res, 201, "Usuario creado correctamente.", sanitizeUsuario(newUser));
});

const updateUsuario = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, usuario, contrasena, rol, estado } = req.body;

  const existingUser = await prisma.usuario.findFirst({
    where: {
      id_usuario: id,
      deleted_at: null,
    },
  });

  if (!existingUser) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  if (usuario && usuario !== existingUser.usuario) {
    const duplicated = await prisma.usuario.findFirst({
      where: {
        usuario,
        deleted_at: null,
        NOT: { id_usuario: id },
      },
    });

    if (duplicated) {
      throw new AppError("El nombre de usuario ya existe.", 409);
    }
  }

  const updatedUser = await prisma.usuario.update({
    where: { id_usuario: id },
    data: {
      nombre: nombre ?? existingUser.nombre,
      usuario: usuario ?? existingUser.usuario,
      contrasena: contrasena ? await bcrypt.hash(contrasena, 10) : existingUser.contrasena,
      rol: rol ?? existingUser.rol,
      estado: typeof estado === "boolean" ? estado : existingUser.estado,
    },
  });

  sendResponse(res, 200, "Usuario actualizado correctamente.", sanitizeUsuario(updatedUser));
});

const deleteUsuario = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const existingUser = await prisma.usuario.findFirst({
    where: {
      id_usuario: id,
      deleted_at: null,
    },
  });

  if (!existingUser) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  const usuario = await prisma.usuario.update({
    where: { id_usuario: id },
    data: {
      estado: false,
      deleted_at: new Date(),
    },
  });

  sendResponse(res, 200, "Usuario eliminado correctamente.", sanitizeUsuario(usuario));
});

module.exports = {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};
