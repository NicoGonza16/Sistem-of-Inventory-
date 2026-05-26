const prisma = require("../config/database");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/response");

const getAllCategorias = asyncHandler(async (req, res) => {
  const categorias = await prisma.categoria.findMany({
    where: { deleted_at: null },
    include: {
      productos: {
        where: { deleted_at: null },
      },
    },
    orderBy: { id_categoria: "asc" },
  });

  sendResponse(res, 200, "Categorías obtenidas correctamente.", categorias);
});

const getCategoriaById = asyncHandler(async (req, res) => {
  const categoria = await prisma.categoria.findFirst({
    where: {
      id_categoria: Number(req.params.id),
      deleted_at: null,
    },
    include: {
      productos: {
        where: { deleted_at: null },
      },
    },
  });

  if (!categoria) {
    throw new AppError("Categoría no encontrada.", 404);
  }

  sendResponse(res, 200, "Categoría obtenida correctamente.", categoria);
});

const createCategoria = asyncHandler(async (req, res) => {
  const { nombre_categoria } = req.body;

  if (!nombre_categoria) {
    throw new AppError("El nombre de la categoría es obligatorio.", 400);
  }

  const categoria = await prisma.categoria.create({
    data: { nombre_categoria },
  });

  sendResponse(res, 201, "Categoría creada correctamente.", categoria);
});

const updateCategoria = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { nombre_categoria } = req.body;

  const existing = await prisma.categoria.findFirst({
    where: {
      id_categoria: id,
      deleted_at: null,
    },
  });

  if (!existing) {
    throw new AppError("Categoría no encontrada.", 404);
  }

  const categoria = await prisma.categoria.update({
    where: { id_categoria: id },
    data: {
      nombre_categoria: nombre_categoria ?? existing.nombre_categoria,
    },
  });

  sendResponse(res, 200, "Categoría actualizada correctamente.", categoria);
});

const deleteCategoria = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const existing = await prisma.categoria.findFirst({
    where: {
      id_categoria: id,
      deleted_at: null,
    },
  });

  if (!existing) {
    throw new AppError("Categoría no encontrada.", 404);
  }

  const categoria = await prisma.categoria.update({
    where: { id_categoria: id },
    data: { deleted_at: new Date() },
    include: {
      productos: {
        where: { deleted_at: null },
      },
    },
  });

  sendResponse(res, 200, "Categoría eliminada correctamente.", categoria);
});

module.exports = {
  getAllCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
};
