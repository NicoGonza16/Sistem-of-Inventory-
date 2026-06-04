import {
  lazy,
  Suspense,
  useEffect,
  useState,
} from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";

import { getReportes } from "../../services/reportes.service";

const SalesOverviewChart = lazy(() =>
  import("../../components/charts/SalesOverviewChart")
);

const StatusPieChart = lazy(() =>
  import("../../components/charts/StatusPieChart")
);

function Reportes() {
  const [loading, setLoading] =
    useState(true);

  const [data, setData] =
    useState();

  useEffect(() => {
    getReportes()
      .then(setData)
      .finally(() =>
        setLoading(false)
      );
  }, []);

  if (loading || !data) {
    return (
      <Loader label="Compilando reportes..." />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-5">
            <p className="text-sm text-slate-400">
              Histórico
            </p>

            <h1 className="text-2xl font-semibold text-white">
              Ventas diarias
            </h1>
          </div>

          <Suspense
            fallback={
              <Loader label="Cargando gráfico..." />
            }
          >
            <SalesOverviewChart
              data={data.dailySales}
            />
          </Suspense>
        </Card>

        <Card>
          <div className="mb-5">
            <p className="text-sm text-slate-400">
              Actividad
            </p>

            <h2 className="text-2xl font-semibold text-white">
              Estado de ingresos
            </h2>
          </div>

          <Suspense
            fallback={
              <Loader label="Cargando gráfico..." />
            }
          >
            <StatusPieChart
              data={data.incomeByState}
            />
          </Suspense>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-5">
            <p className="text-sm text-slate-400">
              Top performance
            </p>

            <h2 className="text-2xl font-semibold text-white">
              Productos más vendidos
            </h2>
          </div>

          <div className="h-80">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={data.topProducts}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.12)"
                />

                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                />

                <YAxis
                  stroke="#64748b"
                />

                <Tooltip
                  contentStyle={{
                    background:
                      "#020617",
                    border:
                      "1px solid rgba(148,163,184,0.14)",
                    borderRadius:
                      "16px",
                  }}
                />

                <Bar
                  dataKey="sales"
                  radius={[
                    10,
                    10,
                    0,
                    0,
                  ]}
                  fill="#22d3ee"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-5">
            <p className="text-sm text-slate-400">
              Acción rápida
            </p>

            <h2 className="text-2xl font-semibold text-white">
              Alertas de stock
            </h2>
          </div>

          <div className="space-y-3">
            {data.lowStock.length ? (
              data.lowStock.map(
                (item) => (
                  <div
                    key={item.nombre}
                    className="panel-soft p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">
                          {item.nombre}
                        </p>

                        <p className="text-sm text-slate-400">
                          Minimo sugerido:{" "}
                          {item.minimo}
                        </p>
                      </div>

                      <span className="rounded-full bg-amber-500/15 px-3 py-1 text-sm font-medium text-amber-300">
                        {item.stock}
                      </span>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="panel-soft p-8 text-center text-slate-400">
                No hay alertas de
                stock bajo por ahora.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Reportes;