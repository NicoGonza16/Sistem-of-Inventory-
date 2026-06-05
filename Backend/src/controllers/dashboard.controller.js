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

    const lowStock = productos.filter(
      (item) =>
        Number(item.stock) <=
        Number(item.stock_minimo)
    );

    const openAccounts = cuentas.filter(
      (item) => item.estado === "abierta"
    );

    const totalRevenue = cuentas.reduce(
      (acc, item) =>
        acc + Number(item.total || 0),
      0
    );

    const today = new Date();

    const dailyRevenue = cuentas
      .filter((item) => {
        if (!item.fecha_cierre) {
          return false;
        }

        const closeDate = new Date(
          item.fecha_cierre
        );

        return (
          closeDate.getDate() ===
            today.getDate() &&
          closeDate.getMonth() ===
            today.getMonth() &&
          closeDate.getFullYear() ===
            today.getFullYear()
        );
      })
      .reduce(
        (acc, item) =>
          acc + Number(item.total || 0),
        0
      );

    res.json({
      success: true,
      data: {
        summary: {
          totalProductos:
            productos.length,

          lowStockCount:
            lowStock.length,

          occupiedTables:
            mesas.filter(
              (item) =>
                item.estado ===
                "ocupada"
            ).length,

          openAccounts:
            openAccounts.length,

          totalRevenue,

          dailyRevenue,
        },

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