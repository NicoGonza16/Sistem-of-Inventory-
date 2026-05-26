const fs = require("fs/promises");
const path = require("path");
const prisma = require("../config/database");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");

const productoInclude = {
  categoria: true,
  movimientos: {
    where: { deleted_at: null },
  },
  imagenes: {
    orderBy: { created_at: "desc" },
  },
};

const resolveImagePath = (urlImagen) => path.join(process.cwd(), urlImagen.replace(/^\/+/, ""));

const getAllProductos = asyncHandler(async (req, res) => {
  const productos = await prisma.producto.findMany({
    where: { deleted_at: null },
    include: productoInclude,
    orderBy: { id_producto: "asc" },
  });

  sendResponse(res, 200, "Productos obtenidos correctamente.", productos);
});

const getProductoById = asyncHandler(async (req, res) => {
  const producto = await prisma.producto.findFirst({
    where: {
      id_producto: Number(req.params.id),
      deleted_at: null,
    },
    include: productoInclude,
  });

  if (!producto) {
    throw new AppError("Producto no encontrado.", 404);
  }

  sendResponse(res, 200, "Producto obtenido correctamente.", producto);
});

const createProducto = asyncHandler(async (req, res) => {
  const {
    nombre,
    precio_venta,
    stock = 0,
    stock_minimo = 0,
    id_categoria,
    estado = true,
  } = req.body;

  if (!nombre || precio_venta === undefined || id_categoria === undefined) {
    throw new AppError("Nombre, precio de venta e id_categoria son obligatorios.", 400);
  }

  if (Number(stock) < 0 || Number(stock_minimo) < 0) {
    throw new AppError("El stock y stock mínimo no pueden ser negativos.", 400);
  }

  const categoria = await prisma.categoria.findFirst({
    where: {
      id_categoria: Number(id_categoria),
      deleted_at: null,
    },
  });

  if (!categoria) {
    throw new AppError("Categoría válida requerida.", 400);
  }

  const producto = await prisma.producto.create({
    data: {
      nombre,
      precio_venta: Number(precio_venta),
      stock: Number(stock),
      stock_minimo: Number(stock_minimo),
      id_categoria: Number(id_categoria),
      estado,
    },
    include: productoInclude,
  });

  sendResponse(res, 201, "Producto creado correctamente.", producto);
});

const updateProducto = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const payload = req.body;

  const existing = await prisma.producto.findFirst({
    where: {
      id_producto: id,
      deleted_at: null,
    },
  });

  if (!existing) {
    throw new AppError("Producto no encontrado.", 404);
  }

  if (payload.id_categoria !== undefined) {
    const categoria = await prisma.categoria.findFirst({
      where: {
        id_categoria: Number(payload.id_categoria),
        deleted_at: null,
      },
    });

    if (!categoria) {
      throw new AppError("Categoría válida requerida.", 400);
    }
  }

  const nextStock = payload.stock !== undefined ? Number(payload.stock) : existing.stock;
  const nextMinStock =
    payload.stock_minimo !== undefined ? Number(payload.stock_minimo) : existing.stock_minimo;

  if (nextStock < 0 || nextMinStock < 0) {
    throw new AppError("El stock y stock mínimo no pueden ser negativos.", 400);
  }

  const producto = await prisma.producto.update({
    where: { id_producto: id },
    data: {
      nombre: payload.nombre ?? existing.nombre,
      precio_venta:
        payload.precio_venta !== undefined ? Number(payload.precio_venta) : existing.precio_venta,
      stock: nextStock,
      stock_minimo: nextMinStock,
      id_categoria:
        payload.id_categoria !== undefined ? Number(payload.id_categoria) : existing.id_categoria,
      estado: typeof payload.estado === "boolean" ? payload.estado : existing.estado,
    },
    include: productoInclude,
  });

  sendResponse(res, 200, "Producto actualizado correctamente.", producto);
});

const deleteProducto = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const existing = await prisma.producto.findFirst({
    where: {
      id_producto: id,
      deleted_at: null,
    },
    include: {
      imagenes: true,
    },
  });

  if (!existing) {
    throw new AppError("Producto no encontrado.", 404);
  }

  const producto = await prisma.$transaction(async (tx) => {
    await tx.producto.update({
      where: { id_producto: id },
      data: {
        estado: false,
        deleted_at: new Date(),
      },
    });

    await tx.movimientoInventario.updateMany({
      where: { id_producto: id, deleted_at: null },
      data: { deleted_at: new Date() },
    });

    await tx.productoImagen.deleteMany({
      where: { id_producto: id },
    });

    return tx.producto.findUnique({
      where: { id_producto: id },
      include: productoInclude,
    });
  });

  await Promise.all(existing.imagenes.map((image) => fs.unlink(resolveImagePath(image.url_imagen)).catch(() => null)));

  sendResponse(res, 200, "Producto eliminado correctamente.", producto);
});

module.exports = {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
};
