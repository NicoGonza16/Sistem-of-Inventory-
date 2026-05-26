const AppError = require("../utils/appError");

const PRODUCT_INCLUDE = {
  categoria: true,
};

const assertPositiveInteger = (value, fieldName) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new AppError(`${fieldName} debe ser un entero positivo.`, 400);
  }
};

const getActiveProducto = async (tx, idProducto) => {
  const producto = await tx.producto.findFirst({
    where: {
      id_producto: Number(idProducto),
      estado: true,
      deleted_at: null,
    },
    include: PRODUCT_INCLUDE,
  });

  if (!producto) {
    throw new AppError("Producto no encontrado.", 404);
  }

  return producto;
};

const applyStockChange = async (tx, idProducto, delta) => {
  const producto = await getActiveProducto(tx, idProducto);
  const nuevoStock = producto.stock + delta;

  if (nuevoStock < 0) {
    throw new AppError(`Stock insuficiente para el producto ${producto.nombre}.`, 400);
  }

  return tx.producto.update({
    where: { id_producto: producto.id_producto },
    data: { stock: nuevoStock },
    include: PRODUCT_INCLUDE,
  });
};

const applyMovementEffect = async (tx, movement) => {
  assertPositiveInteger(movement.cantidad, "cantidad");

  const delta = movement.tipo_movimiento === "entrada" ? movement.cantidad : -movement.cantidad;
  return applyStockChange(tx, movement.id_producto, delta);
};

const revertMovementEffect = async (tx, movement) => {
  const delta = movement.tipo_movimiento === "entrada" ? -movement.cantidad : movement.cantidad;
  return applyStockChange(tx, movement.id_producto, delta);
};

const recalculateCuentaTotal = async (tx, idCuenta) => {
  const detalles = await tx.detalleCuenta.findMany({
    where: {
      id_cuenta: Number(idCuenta),
      deleted_at: null,
    },
  });

  const total = detalles.reduce((acc, item) => acc + Number(item.subtotal), 0);

  return tx.cuenta.update({
    where: { id_cuenta: Number(idCuenta) },
    data: { total },
    include: {
      mesa: true,
      empleado: {
        select: {
          id_usuario: true,
          nombre: true,
          usuario: true,
          rol: true,
          estado: true,
          created_at: true,
          updated_at: true,
        },
      },
      detalles: {
        where: { deleted_at: null },
        include: {
          producto: true,
        },
      },
    },
  });
};

module.exports = {
  assertPositiveInteger,
  getActiveProducto,
  applyStockChange,
  applyMovementEffect,
  revertMovementEffect,
  recalculateCuentaTotal,
};
