const prisma = require("../config/database");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const {
  getActiveProducto,
  applyStockChange,
  recalculateCuentaTotal,
  assertPositiveInteger,
} = require("../services/inventory.service");

const detalleInclude = {
  cuenta: {
    include: {
      mesa: true,
      empleado: {
        select: {
          id_usuario: true,
          nombre: true,
          usuario: true,
          rol: true,
        },
      },
    },
  },
  producto: {
    include: {
      categoria: true,
    },
  },
};

const getAllDetalles = asyncHandler(async (req, res) => {
  const detalles = await prisma.detalleCuenta.findMany({
    where: { deleted_at: null },
    include: detalleInclude,
    orderBy: { id_detalle: "desc" },
  });

  sendResponse(res, 200, "Detalles de cuenta obtenidos correctamente.", detalles);
});

const getDetalleById = asyncHandler(async (req, res) => {
  const detalle = await prisma.detalleCuenta.findFirst({
    where: {
      id_detalle: Number(req.params.id),
      deleted_at: null,
    },
    include: detalleInclude,
  });

  if (!detalle) {
    throw new AppError("Detalle de cuenta no encontrado.", 404);
  }

  sendResponse(res, 200, "Detalle de cuenta obtenido correctamente.", detalle);
});

const createDetalle = asyncHandler(async (req, res) => {
  const { id_cuenta, id_producto, cantidad, precio_unitario } = req.body;

  if (!id_cuenta || !id_producto || cantidad === undefined) {
    throw new AppError("id_cuenta, id_producto y cantidad son obligatorios.", 400);
  }

  assertPositiveInteger(Number(cantidad), "cantidad");

  const detalle = await prisma.$transaction(async (tx) => {
    const cuenta = await tx.cuenta.findFirst({
      where: {
        id_cuenta: Number(id_cuenta),
        deleted_at: null,
      },
    });

    if (!cuenta) {
      throw new AppError("Cuenta no encontrada.", 404);
    }

    if (cuenta.estado !== "abierta") {
      throw new AppError("No se pueden agregar productos a una cuenta cerrada.", 400);
    }

    const producto = await getActiveProducto(tx, Number(id_producto));
    const unitPrice = precio_unitario !== undefined ? Number(precio_unitario) : Number(producto.precio_venta);
    const subtotal = Number(cantidad) * unitPrice;

    await applyStockChange(tx, producto.id_producto, -Number(cantidad));

    const createdDetail = await tx.detalleCuenta.create({
      data: {
        id_cuenta: Number(id_cuenta),
        id_producto: producto.id_producto,
        cantidad: Number(cantidad),
        precio_unitario: unitPrice,
        subtotal,
      },
      include: detalleInclude,
    });

    await tx.movimientoInventario.create({
      data: {
        id_producto: producto.id_producto,
        tipo_movimiento: "salida",
        cantidad: Number(cantidad),
        observacion: `Salida automática por detalle de cuenta #${id_cuenta}`,
      },
    });

    await recalculateCuentaTotal(tx, Number(id_cuenta));

    return createdDetail;
  });

  sendResponse(res, 201, "Detalle de cuenta creado correctamente.", detalle);
});

const updateDetalle = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { id_producto, cantidad, precio_unitario } = req.body;

  const existing = await prisma.detalleCuenta.findFirst({
    where: {
      id_detalle: id,
      deleted_at: null,
    },
    include: {
      cuenta: true,
      producto: true,
    },
  });

  if (!existing) {
    throw new AppError("Detalle de cuenta no encontrado.", 404);
  }

  if (existing.cuenta.estado !== "abierta") {
    throw new AppError("No se puede modificar un detalle de una cuenta cerrada.", 400);
  }

  const detalle = await prisma.$transaction(async (tx) => {
    const originalProductId = existing.id_producto;
    const nextProductId = id_producto !== undefined ? Number(id_producto) : originalProductId;
    const nextQuantity = cantidad !== undefined ? Number(cantidad) : existing.cantidad;

    assertPositiveInteger(nextQuantity, "cantidad");

    await applyStockChange(tx, originalProductId, existing.cantidad);

    const producto = await getActiveProducto(tx, nextProductId);
    const unitPrice = precio_unitario !== undefined ? Number(precio_unitario) : Number(existing.precio_unitario);
    const subtotal = nextQuantity * unitPrice;

    await applyStockChange(tx, nextProductId, -nextQuantity);

    const updatedDetail = await tx.detalleCuenta.update({
      where: { id_detalle: id },
      data: {
        id_producto: nextProductId,
        cantidad: nextQuantity,
        precio_unitario: unitPrice,
        subtotal,
      },
      include: detalleInclude,
    });

    const quantityDelta = nextQuantity - existing.cantidad;

    if (originalProductId !== nextProductId) {
      await tx.movimientoInventario.create({
        data: {
          id_producto: originalProductId,
          tipo_movimiento: "entrada",
          cantidad: existing.cantidad,
          observacion: `Reversión por actualización de detalle #${id}`,
        },
      });

      await tx.movimientoInventario.create({
        data: {
          id_producto: nextProductId,
          tipo_movimiento: "salida",
          cantidad: nextQuantity,
          observacion: `Salida por actualización de detalle #${id}`,
        },
      });
    } else if (quantityDelta !== 0) {
      await tx.movimientoInventario.create({
        data: {
          id_producto: nextProductId,
          tipo_movimiento: quantityDelta > 0 ? "salida" : "entrada",
          cantidad: Math.abs(quantityDelta),
          observacion: `Ajuste automático por actualización de detalle #${id}`,
        },
      });
    }

    await recalculateCuentaTotal(tx, existing.id_cuenta);

    return updatedDetail;
  });

  sendResponse(res, 200, "Detalle de cuenta actualizado correctamente.", detalle);
});

const deleteDetalle = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const existing = await prisma.detalleCuenta.findFirst({
    where: {
      id_detalle: id,
      deleted_at: null,
    },
    include: {
      cuenta: true,
    },
  });

  if (!existing) {
    throw new AppError("Detalle de cuenta no encontrado.", 404);
  }

  if (existing.cuenta.estado !== "abierta") {
    throw new AppError("No se puede eliminar un detalle de una cuenta cerrada.", 400);
  }

  const detalle = await prisma.$transaction(async (tx) => {
    await applyStockChange(tx, existing.id_producto, existing.cantidad);

    const deletedDetail = await tx.detalleCuenta.update({
      where: { id_detalle: id },
      data: {
        deleted_at: new Date(),
      },
      include: detalleInclude,
    });

    await tx.movimientoInventario.create({
      data: {
        id_producto: existing.id_producto,
        tipo_movimiento: "entrada",
        cantidad: existing.cantidad,
        observacion: `Reversión por eliminación de detalle #${id}`,
      },
    });

    await recalculateCuentaTotal(tx, existing.id_cuenta);

    return deletedDetail;
  });

  sendResponse(res, 200, "Detalle de cuenta eliminado correctamente.", detalle);
});

module.exports = {
  getAllDetalles,
  getDetalleById,
  createDetalle,
  updateDetalle,
  deleteDetalle,
};
