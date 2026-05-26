import { getProductos } from "./productos.service";
import { getCuentas, getDetalleCuenta } from "./cuentas.service";

const buildMockReports = () => ({
  dailySales: [
    { day: "Lun", total: 320 },
    { day: "Mar", total: 510 },
    { day: "Mie", total: 450 },
    { day: "Jue", total: 680 },
    { day: "Vie", total: 910 },
    { day: "Sab", total: 1120 },
    { day: "Dom", total: 760 },
  ],
  topProducts: [
    { name: "Mojito", sales: 44 },
    { name: "Hamburguesa", sales: 31 },
    { name: "Cerveza IPA", sales: 29 },
    { name: "Papas Bravas", sales: 25 },
  ],
  incomeByState: [
    { name: "Cerradas", value: 72 },
    { name: "Abiertas", value: 28 },
  ],
  lowStock: [],
});

export const getReportes = async () => {
  try {
    const [productosRes, cuentasRes, detalleRes] = await Promise.all([
      getProductos(),
      getCuentas(),
      getDetalleCuenta(),
    ]);

    const productos = productosRes.data || [];
    const cuentas = cuentasRes.data || [];
    const detalles = detalleRes.data || [];

    const lowStock = productos
      .filter((item) => Number(item.stock) <= Number(item.stock_minimo))
      .map((item) => ({
        nombre: item.nombre,
        stock: item.stock,
        minimo: item.stock_minimo,
      }));

    const dailyMap = new Map();
    cuentas
      .filter((item) => item.fecha_cierre)
      .forEach((item) => {
        const day = new Date(item.fecha_cierre).toLocaleDateString("es-CO", { weekday: "short" });
        dailyMap.set(day, (dailyMap.get(day) || 0) + Number(item.total || 0));
      });

    const productSalesMap = new Map();
    detalles.forEach((item) => {
      const productName = item.producto?.nombre || `Producto ${item.id_producto}`;
      productSalesMap.set(productName, (productSalesMap.get(productName) || 0) + Number(item.cantidad || 0));
    });

    return {
      dailySales:
        [...dailyMap.entries()].map(([day, total]) => ({ day, total })) || buildMockReports().dailySales,
      topProducts:
        [...productSalesMap.entries()]
          .map(([name, sales]) => ({ name, sales }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5) || buildMockReports().topProducts,
      incomeByState: [
        { name: "Cerradas", value: cuentas.filter((item) => item.estado === "cerrada").length },
        { name: "Abiertas", value: cuentas.filter((item) => item.estado === "abierta").length },
      ],
      lowStock,
    };
  } catch (error) {
    return buildMockReports();
  }
};
