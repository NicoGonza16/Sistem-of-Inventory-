const prisma = require("../config/database");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");

const mesaInclude = {
  cuentas: {
    where: { deleted_at: null },
  },
};

const getAllMesas = asyncHandler(async (req, res) => {
  const mesas = await prisma.mesa.findMany({
    where: { deleted_at: null },
    include: mesaInclude,
    orderBy: { numero_mesa: "asc" },
  });

  sendResponse(res, 200, "Mesas obtenidas correctamente.", mesas);
});

const getMesaById = asyncHandler(async (req, res) => {
  const mesa = await prisma.mesa.findFirst({
    where: {
      id_mesa: Number(req.params.id),
      deleted_at: null,
    },
    include: mesaInclude,
  });

  if (!mesa) {
    throw new AppError("Mesa no encontrada.", 404);
  }

  sendResponse(res, 200, "Mesa obtenida correctamente.", mesa);
});

const createMesa = asyncHandler(async (req, res) => {
  const { numero_mesa, estado = "libre" } = req.body;

  if (!numero_mesa) {
    throw new AppError("El número de mesa es obligatorio.", 400);
  }

  const existing = await prisma.mesa.findFirst({
    where: {
      numero_mesa: Number(numero_mesa),
    },
  });

  if (existing) {
    throw new AppError("El número de mesa ya existe.", 409);
  }

  const mesa = await prisma.mesa.create({
    data: {
      numero_mesa: Number(numero_mesa),
      estado,
    },
    include: mesaInclude,
  });

  sendResponse(res, 201, "Mesa creada correctamente.", mesa);
});

const updateMesa = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { numero_mesa, estado } = req.body;

  const existing = await prisma.mesa.findFirst({
    where: {
      id_mesa: id,
      deleted_at: null,
    },
  });

  if (!existing) {
    throw new AppError("Mesa no encontrada.", 404);
  }

  if (numero_mesa !== undefined && Number(numero_mesa) !== existing.numero_mesa) {
    const duplicate = await prisma.mesa.findFirst({
      where: {
        numero_mesa: Number(numero_mesa),
        NOT: { id_mesa: id },
      },
    });

    if (duplicate) {
      throw new AppError("El número de mesa ya existe.", 409);
    }
  }

  const mesa = await prisma.mesa.update({
    where: { id_mesa: id },
    data: {
      numero_mesa: numero_mesa !== undefined ? Number(numero_mesa) : existing.numero_mesa,
      estado: estado ?? existing.estado,
    },
    include: mesaInclude,
  });

  sendResponse(res, 200, "Mesa actualizada correctamente.", mesa);
});

const deleteMesa = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const existing = await prisma.mesa.findFirst({
    where: {
      id_mesa: id,
      deleted_at: null,
    },
    include: {
      cuentas: {
        where: { deleted_at: null },
      },
    },
  });

  if (!existing) {
    throw new AppError("Mesa no encontrada.", 404);
  }

  if (existing.cuentas.length > 0) {
    throw new AppError("No se puede eliminar una mesa con cuentas asociadas.", 400);
  }

  const mesa = await prisma.mesa.update({
    where: { id_mesa: id },
    data: {
      deleted_at: new Date(),
    },
    include: mesaInclude,
  });

  sendResponse(res, 200, "Mesa eliminada correctamente.", mesa);
});

module.exports = {
  getAllMesas,
  getMesaById,
  createMesa,
  updateMesa,
  deleteMesa,
};
