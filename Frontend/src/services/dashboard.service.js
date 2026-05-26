import { getProductos } from "./productos.service";
import { getMesas } from "./mesas.service";
import { getCuentas } from "./cuentas.service";

export const getDashboardMetrics = async () => {
  const [productosRes, mesasRes, cuentasRes] = await Promise.all([
    getProductos(),
    getMesas(),
    getCuentas(),
  ]);

  const productos = productosRes.data || [];
  const mesas = mesasRes.data || [];
  const cuentas = cuentasRes.data || [];

  const lowStock = productos.filter((item) => Number(item.stock) <= Number(item.stock_minimo));
  const openAccounts = cuentas.filter((item) => item.estado === "abierta");
  const dailySales = cuentas.filter((item) => {
    const closeDate = item.fecha_cierre ? new Date(item.fecha_cierre) : null;
    const today = new Date();
    return (
      closeDate &&
      closeDate.getDate() === today.getDate() &&
      closeDate.getMonth() === today.getMonth() &&
      closeDate.getFullYear() === today.getFullYear()
    );
  });

  const totalRevenue = cuentas.reduce((acc, item) => acc + Number(item.total || 0), 0);

  return {
    productos,
    mesas,
    cuentas,
    summary: {
      totalProductos: productos.length,
      lowStockCount: lowStock.length,
      occupiedTables: mesas.filter((item) => item.estado === "ocupada").length,
      openAccounts: openAccounts.length,
      totalRevenue,
      dailyRevenue: dailySales.reduce((acc, item) => acc + Number(item.total || 0), 0),
    },
  };
};
