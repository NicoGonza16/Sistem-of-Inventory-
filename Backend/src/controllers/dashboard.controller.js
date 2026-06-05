const prisma = require("../config/database");

const getDashboard = async (req, res, next) => {
  try {
    const [
      productos,
      categorias,
      mesas,
      cuentas,
      detalleCuenta,
    ] = await Promise.all([
      prisma.producto.findMany(),
      prisma.categoria.findMany(),
      prisma.mesa.findMany(),
      prisma.cuenta.findMany(),
      prisma.detalleCuenta.findMany(),
    ]);

    res.json({
      success: true,
      data: {
        productos,
        categorias,
        mesas,
        cuentas,
        detalleCuenta,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
};