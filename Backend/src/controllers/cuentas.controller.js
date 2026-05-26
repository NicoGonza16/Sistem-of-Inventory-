const prisma = require("../config/database");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");
const { recalculateCuentaTotal } = require("../services/inventory.service");

const cuentaInclude = {
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
      producto: {
        include: {
          imagenes: true,
        },
      },
    },
  },
};

const getAllCuentas = asyncHandler(async (req, res) => {
  const cuentas = await prisma.cuenta.findMany({
    where: { deleted_at: null },
    include: cuentaInclude,
    orderBy: { id_cuenta: "desc" },
  });

  sendResponse(res, 200, "Cuentas obtenidas correctamente.", cuentas);
});

const getCuentaById = asyncHandler(async (req, res) => {
  const cuenta = await prisma.cuenta.findFirst({
    where: {
      id_cuenta: Number(req.params.id),
      deleted_at: null,
    },
    include: cuentaInclude,
  });

  if (!cuenta) {
    throw new AppError("Cuenta no encontrada.", 404);
  }

  sendResponse(res, 200, "Cuenta obtenida correctamente.", cuenta);
});

const createCuenta = asyncHandler(async (req, res) => {
  const { id_mesa, id_empleado } = req.body;

  if (!id_mesa || !id_empleado) {
    throw new AppError("id_mesa e id_empleado son obligatorios.", 400);
  }

  const cuenta = await prisma.$transaction(async (tx) => {
    const mesa = await tx.mesa.findFirst({
      where: {
        id_mesa: Number(id_mesa),
        deleted_at: null,
      },
    });

    if (!mesa) {
      throw new AppError("Mesa no encontrada.", 404);
    }

    const empleado = await tx.usuario.findFirst({
      where: {
        id_usuario: Number(id_empleado),
        estado: true,
        deleted_at: null,
      },
    });

    if (!empleado) {
      throw new AppError("Empleado no encontrado.", 404);
    }

    const cuentaAbierta = await tx.cuenta.findFirst({
      where: {
        id_mesa: Number(id_mesa),
        estado: "abierta",
        deleted_at: null,
      },
    });

    if (cuentaAbierta) {
      throw new AppError("La mesa ya tiene una cuenta abierta.", 400);
    }

    await tx.mesa.update({
      where: { id_mesa: Number(id_mesa) },
      data: { estado: "ocupada" },
    });

    return tx.cuenta.create({
      data: {
        id_mesa: Number(id_mesa),
        id_empleado: Number(id_empleado),
      },
      include: cuentaInclude,
    });
  });

  sendResponse(res, 201, "Cuenta creada correctamente.", cuenta);
});

const updateCuenta = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { id_mesa, id_empleado, estado, fecha_cierre } = req.body;

  const existing = await prisma.cuenta.findFirst({
    where: {
      id_cuenta: id,
      deleted_at: null,
    },
    include: {
      detalles: {
        where: { deleted_at: null },
      },
    },
  });

  if (!existing) {
    throw new AppError("Cuenta no encontrada.", 404);
  }

  const cuenta = await prisma.$transaction(async (tx) => {
    let mesaId = existing.id_mesa;
    let empleadoId = existing.id_empleado;

    if (id_mesa !== undefined && Number(id_mesa) !== existing.id_mesa) {
      const mesa = await tx.mesa.findFirst({
        where: {
          id_mesa: Number(id_mesa),
          deleted_at: null,
        },
      });

      if (!mesa) {
        throw new AppError("Mesa no encontrada.", 404);
      }

      const cuentaAbierta = await tx.cuenta.findFirst({
        where: {
          id_mesa: Number(id_mesa),
          estado: "abierta",
          deleted_at: null,
          NOT: { id_cuenta: id },
        },
      });

      if (cuentaAbierta) {
        throw new AppError("La nueva mesa ya tiene una cuenta abierta.", 400);
      }

      await tx.mesa.update({
        where: { id_mesa: existing.id_mesa },
        data: { estado: "libre" },
      });

      await tx.mesa.update({
        where: { id_mesa: Number(id_mesa) },
        data: { estado: estado === "cerrada" ? "libre" : "ocupada" },
      });

      mesaId = Number(id_mesa);
    }

    if (id_empleado !== undefined && Number(id_empleado) !== existing.id_empleado) {
      const empleado = await tx.usuario.findFirst({
        where: {
          id_usuario: Number(id_empleado),
          estado: true,
          deleted_at: null,
        },
      });

      if (!empleado) {
        throw new AppError("Empleado no encontrado.", 404);
      }

      empleadoId = Number(id_empleado);
    }

    if (estado === "cerrada") {
      await tx.mesa.update({
        where: { id_mesa: mesaId },
        data: { estado: "libre" },
      });
    }

    if (estado === "abierta") {
      await tx.mesa.update({
        where: { id_mesa: mesaId },
        data: { estado: "ocupada" },
      });
    }

    await tx.cuenta.update({
      where: { id_cuenta: id },
      data: {
        id_mesa: mesaId,
        id_empleado: empleadoId,
        estado: estado ?? existing.estado,
        fecha_cierre:
          estado === "cerrada"
            ? fecha_cierre
              ? new Date(fecha_cierre)
              : new Date()
            : estado === "abierta"
              ? null
              : existing.fecha_cierre,
      },
    });

    return recalculateCuentaTotal(tx, id);
  });

  sendResponse(res, 200, "Cuenta actualizada correctamente.", cuenta);
});

const deleteCuenta = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const existing = await prisma.cuenta.findFirst({
    where: {
      id_cuenta: id,
      deleted_at: null,
    },
    include: {
      detalles: {
        where: { deleted_at: null },
      },
    },
  });

  if (!existing) {
    throw new AppError("Cuenta no encontrada.", 404);
  }

  const cuenta = await prisma.$transaction(async (tx) => {
    if (existing.estado === "abierta") {
      for (const detalle of existing.detalles) {
        const producto = await tx.producto.findUnique({
          where: { id_producto: detalle.id_producto },
        });

        if (producto) {
          await tx.producto.update({
            where: { id_producto: detalle.id_producto },
            data: {
              stock: producto.stock + detalle.cantidad,
            },
          });

          await tx.movimientoInventario.create({
            data: {
              id_producto: detalle.id_producto,
              tipo_movimiento: "entrada",
              cantidad: detalle.cantidad,
              observacion: `Reversión automática por eliminación de cuenta #${existing.id_cuenta}`,
            },
          });
        }
      }
    }

    await tx.detalleCuenta.updateMany({
      where: {
        id_cuenta: id,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    await tx.mesa.update({
      where: { id_mesa: existing.id_mesa },
      data: { estado: "libre" },
    });

    return tx.cuenta.update({
      where: { id_cuenta: id },
      data: {
        deleted_at: new Date(),
      },
      include: cuentaInclude,
    });
  });

  sendResponse(res, 200, "Cuenta eliminada correctamente.", cuenta);
});

module.exports = {
  getAllCuentas,
  getCuentaById,
  createCuenta,
  updateCuenta,
  deleteCuenta,
};
