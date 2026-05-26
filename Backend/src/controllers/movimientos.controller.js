const prisma = require("../config/database");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const {
  applyMovementEffect,
  revertMovementEffect,
  assertPositiveInteger,
} = require("../services/inventory.service");

const movimientoInclude = {
  producto: {
    include: {
      categoria: true,
    },
  },
};

const getAllMovimientos = asyncHandler(async (req, res) => {
  const movimientos = await prisma.movimientoInventario.findMany({
    where: { deleted_at: null },
    include: movimientoInclude,
    orderBy: { id_movimiento: "desc" },
  });

  sendResponse(res, 200, "Movimientos obtenidos correctamente.", movimientos);
});

const getMovimientoById = asyncHandler(async (req, res) => {
  const movimiento = await prisma.movimientoInventario.findFirst({
    where: {
      id_movimiento: Number(req.params.id),
      deleted_at: null,
    },
    include: movimientoInclude,
  });

  if (!movimiento) {
    throw new AppError("Movimiento no encontrado.", 404);
  }

  sendResponse(res, 200, "Movimiento obtenido correctamente.", movimiento);
});

const createMovimiento = asyncHandler(async (req, res) => {
  const { id_producto, tipo_movimiento, cantidad, fecha, observacion } = req.body;

  if (!id_producto || !tipo_movimiento || cantidad === undefined) {
    throw new AppError("id_producto, tipo_movimiento y cantidad son obligatorios.", 400);
  }

  assertPositiveInteger(Number(cantidad), "cantidad");

  const movimiento = await prisma.$transaction(async (tx) => {
    await applyMovementEffect(tx, {
      id_producto: Number(id_producto),
      tipo_movimiento,
      cantidad: Number(cantidad),
    });

    return tx.movimientoInventario.create({
      data: {
        id_producto: Number(id_producto),
        tipo_movimiento,
        cantidad: Number(cantidad),
        fecha: fecha ? new Date(fecha) : new Date(),
        observacion,
      },
      include: movimientoInclude,
    });
  });

  sendResponse(res, 201, "Movimiento creado correctamente.", movimiento);
});

const updateMovimiento = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { id_producto, tipo_movimiento, cantidad, fecha, observacion } = req.body;

  const existing = await prisma.movimientoInventario.findFirst({
    where: {
      id_movimiento: id,
      deleted_at: null,
    },
  });

  if (!existing) {
    throw new AppError("Movimiento no encontrado.", 404);
  }

  const movement = await prisma.$transaction(async (tx) => {
    await revertMovementEffect(tx, existing);

    const nextMovement = {
      id_producto: id_producto !== undefined ? Number(id_producto) : existing.id_producto,
      tipo_movimiento: tipo_movimiento ?? existing.tipo_movimiento,
      cantidad: cantidad !== undefined ? Number(cantidad) : existing.cantidad,
    };

    assertPositiveInteger(nextMovement.cantidad, "cantidad");

    await applyMovementEffect(tx, nextMovement);

    return tx.movimientoInventario.update({
      where: { id_movimiento: id },
      data: {
        id_producto: nextMovement.id_producto,
        tipo_movimiento: nextMovement.tipo_movimiento,
        cantidad: nextMovement.cantidad,
        fecha: fecha ? new Date(fecha) : existing.fecha,
        observacion: observacion ?? existing.observacion,
      },
      include: movimientoInclude,
    });
  });

  sendResponse(res, 200, "Movimiento actualizado correctamente.", movement);
});

const deleteMovimiento = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const existing = await prisma.movimientoInventario.findFirst({
    where: {
      id_movimiento: id,
      deleted_at: null,
    },
  });

  if (!existing) {
    throw new AppError("Movimiento no encontrado.", 404);
  }

  const movimiento = await prisma.$transaction(async (tx) => {
    await revertMovementEffect(tx, existing);

    return tx.movimientoInventario.update({
      where: { id_movimiento: id },
      data: {
        deleted_at: new Date(),
      },
      include: movimientoInclude,
    });
  });

  sendResponse(res, 200, "Movimiento eliminado correctamente.", movimiento);
});

module.exports = {
  getAllMovimientos,
  getMovimientoById,
  createMovimiento,
  updateMovimiento,
  deleteMovimiento,
};
