import {
  lazy,
  Suspense,
  useEffect,
  useState,
} from "react";

import {
  FiAlertTriangle,
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";

import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";

import { getDashboardMetrics } from "../../services/dashboard.service";

import { getReportes } from "../../services/reportes.service";

const SalesOverviewChart = lazy(() =>
  import("../../components/charts/SalesOverviewChart")
);

const StatusPieChart = lazy(() =>
  import("../../components/charts/StatusPieChart")
);

function Dashboard() {
  const [loading, setLoading] =
    useState(true);

  const [metrics, setMetrics] =
    useState();

  const [reportes, setReportes] =
    useState();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          dashboardData,
          reportesData,
        ] = await Promise.all([
          getDashboardMetrics(),
          getReportes(),
        ]);

        setMetrics(dashboardData);

        setReportes(reportesData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (
    loading ||
    !metrics ||
    !reportes
  ) {
    return (
      <Loader label="Construyendo dashboard ejecutivo..." />
    );
  }

  const summaryCards = [
    {
      label: "Ingresos totales",
      value: `$${metrics.summary.totalRevenue.toFixed(
        2
      )}`,
      icon: FiDollarSign,
    },

    {
      label: "Ventas del día",
      value: `$${metrics.summary.dailyRevenue.toFixed(
        2
      )}`,
      icon: FiShoppingBag,
    },

    {
      label: "Mesas ocupadas",
      value:
        metrics.summary
          .occupiedTables,
      icon: FiUsers,
    },

    {
      label: "Stock bajo",
      value:
        metrics.summary.lowStockCount,
      icon: FiAlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card
            key={card.label}
            className="overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  {card.label}
                </p>

                <h3 className="mt-3 text-3xl font-semibold text-white">
                  {card.value}
                </h3>
              </div>

              <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
                <card.icon className="text-xl" />
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="mb-5">
            <p className="text-sm text-slate-400">
              Rendimiento
            </p>

            <h3 className="text-xl font-semibold text-white">
              Ventas de la semana
            </h3>
          </div>

          <Suspense fallback={<Loader label="Cargando gráfico..." />}>
            <SalesOverviewChart data={reportes.dailySales} />
          </Suspense>
        </Card>

        <Card>
          <div className="mb-5">
            <p className="text-sm text-slate-400">
              Distribución
            </p>

            <h3 className="text-xl font-semibold text-white">
              Estado de cuentas
            </h3>
          </div>

          <Suspense fallback={<Loader label="Cargando gráfico..." />}>
            <StatusPieChart data={reportes.incomeByState} />
          </Suspense>

          <div className="grid grid-cols-2 gap-3">
            {reportes.incomeByState.map(
              (item) => (
                <div
                  key={item.name}
                  className="panel-soft p-3"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {item.name}
                  </p>

                  <p className="mt-2 text-xl font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              )
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Atención inmediata
              </p>

              <h3 className="text-xl font-semibold text-white">
                Productos con stock bajo
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {reportes.lowStock.length ? (
              reportes.lowStock.map(
                (item) => (
                  <div
                    key={item.nombre}
                    className="panel-soft flex items-center justify-between p-4"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {item.nombre}
                      </p>

                      <p className="text-sm text-slate-400">
                        Minimo sugerido:{" "}
                        {item.minimo}
                      </p>
                    </div>

                    <span className="rounded-full bg-rose-500/10 px-3 py-1 text-sm font-medium text-rose-300">
                      Stock:{" "}
                      {item.stock}
                    </span>
                  </div>
                )
              )
            ) : (
              <div className="panel-soft p-8 text-center text-slate-400">
                Todo el inventario
                está por encima del
                mínimo.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-5">
            <p className="text-sm text-slate-400">
              Top sellers
            </p>

            <h3 className="text-xl font-semibold text-white">
              Productos más vendidos
            </h3>
          </div>

          <div className="space-y-3">
            {reportes.topProducts.map(
              (item, index) => (
                <div
                  key={item.name}
                  className="panel-soft flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-medium text-white">
                        {item.name}
                      </p>

                      <p className="text-sm text-slate-400">
                        Rotación
                        destacada
                      </p>
                    </div>
                  </div>

                  <span className="text-lg font-semibold text-white">
                    {item.sales}
                  </span>
                </div>
              )
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

export default Dashboard;
