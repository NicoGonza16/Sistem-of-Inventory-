import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiEye,
  FiTrash2,
} from "react-icons/fi";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";

import { useAuth } from "../../context/AuthContext";

import useAsyncAction from "../../hooks/useAsyncAction";

import {
  deleteCuenta,
  getCuentas,
  updateCuenta,
} from "../../services/cuentas.service";

function Cuentas() {
  const { user } = useAuth();

  const isAdmin =
    user?.rol === "admin";

  const [cuentas, setCuentas] =
    useState([]);

  const [loadingPage, setLoadingPage] =
    useState(true);

  const [
    selectedCuenta,
    setSelectedCuenta,
  ] = useState(null);

  const [
    confirmState,
    setConfirmState,
  ] = useState({
    open: false,
    cuenta: null,
  });

  const { execute, loading } =
    useAsyncAction();

  const loadCuentas = async () => {
    const response =
      await getCuentas();

    setCuentas(response.data || []);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadCuentas();
      } catch (error) {
        console.error(
          "Error cargando cuentas:",
          error
        );
      } finally {
        setLoadingPage(false);
      }
    };

    init();
  }, []);

  const resumen = useMemo(() => {
    let abiertas = 0;
    let cerradas = 0;
    let total = 0;

    cuentas.forEach((item) => {
      if (item.estado === "abierta") {
        abiertas++;
      }

      if (item.estado === "cerrada") {
        cerradas++;
      }

      total += Number(
        item.total || 0
      );
    });

    return {
      abiertas,
      cerradas,
      total,
    };
  }, [cuentas]);

  const closeCuenta = async (
    cuenta
  ) => {
    await execute(
      async () => {
        await updateCuenta(
          cuenta.id_cuenta,
          {
            estado: "cerrada",
          }
        );

        await loadCuentas();
      },
      {
        successMessage:
          "Cuenta cerrada.",
      }
    );
  };

  const removeCuenta = async () => {
    if (!confirmState.cuenta) {
      return;
    }

    await execute(
      async () => {
        await deleteCuenta(
          confirmState.cuenta
            .id_cuenta
        );

        if (
          selectedCuenta?.id_cuenta ===
          confirmState.cuenta
            .id_cuenta
        ) {
          setSelectedCuenta(null);
        }

        await loadCuentas();

        setConfirmState({
          open: false,
          cuenta: null,
        });
      },
      {
        successMessage:
          "Cuenta eliminada.",
      }
    );
  };

  if (loadingPage) {
    return (
      <Loader label="Cargando cuentas..." />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-400">
            Cuentas abiertas
          </p>

          <p className="mt-2 text-3xl font-semibold text-cyan-300">
            {resumen.abiertas}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-slate-400">
            Cuentas cerradas
          </p>

          <p className="mt-2 text-3xl font-semibold text-emerald-300">
            {resumen.cerradas}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-slate-400">
            Facturación acumulada
          </p>

          <p className="mt-2 text-3xl font-semibold text-white">
            $
            {resumen.total.toFixed(
              2
            )}
          </p>
        </Card>
      </div>

      <Card>
        <Table
          columns={[
            {
              key: "mesa",
              title: "Mesa",
              render: (row) => (
                <div>
                  <p className="font-medium text-white">
                    Mesa{" "}
                    {
                      row.mesa
                        ?.numero_mesa
                    }
                  </p>

                  <p className="text-xs text-slate-500">
                    Cuenta #
                    {row.id_cuenta}
                  </p>
                </div>
              ),
            },

            {
              key: "empleado",
              title: "Atendió",
              render: (row) =>
                row.empleado
                  ?.nombre ||
                "Sin asignar",
            },

            {
              key: "estado",
              title: "Estado",
              render: (row) => (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    row.estado ===
                    "abierta"
                      ? "bg-cyan-500/15 text-cyan-300"
                      : "bg-emerald-500/15 text-emerald-300"
                  }`}
                >
                  {row.estado}
                </span>
              ),
            },

            {
              key: "total",
              title: "Total",
              render: (row) =>
                `$${Number(
                  row.total
                ).toFixed(2)}`,
            },

            {
              key: "actions",
              title: "Acciones",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    className="px-3 py-2"
                    icon={FiEye}
                    onClick={() =>
                      setSelectedCuenta(
                        row
                      )
                    }
                  >
                    Ver
                  </Button>

                  {row.estado ===
                    "abierta" &&
                  (isAdmin ||
                    user?.rol ===
                      "cajero") ? (
                    <Button
                      className="px-3 py-2"
                      onClick={() =>
                        closeCuenta(
                          row
                        )
                      }
                      loading={
                        loading
                      }
                    >
                      Cerrar
                    </Button>
                  ) : null}

                  {isAdmin ? (
                    <Button
                      variant="danger"
                      className="px-3 py-2"
                      icon={FiTrash2}
                      onClick={() =>
                        setConfirmState(
                          {
                            open: true,
                            cuenta: row,
                          }
                        )
                      }
                    >
                      Eliminar
                    </Button>
                  ) : null}
                </div>
              ),
            },
          ]}
          data={cuentas}
          emptyMessage="Aún no hay cuentas registradas."
        />
      </Card>

      <Modal
        isOpen={Boolean(
          selectedCuenta
        )}
        onClose={() =>
          setSelectedCuenta(null)
        }
        title="Detalle de cuenta"
      >
        {selectedCuenta ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="panel-soft p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Mesa
                </p>

                <p className="mt-2 text-xl font-semibold text-white">
                  {
                    selectedCuenta
                      .mesa
                      ?.numero_mesa
                  }
                </p>
              </div>

              <div className="panel-soft p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Estado
                </p>

                <p className="mt-2 text-xl font-semibold text-white">
                  {
                    selectedCuenta.estado
                  }
                </p>
              </div>

              <div className="panel-soft p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Total
                </p>

                <p className="mt-2 text-xl font-semibold text-white">
                  $
                  {Number(
                    selectedCuenta.total
                  ).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedCuenta
                .detalles
                ?.length ? (
                selectedCuenta.detalles.map(
                  (
                    detalle
                  ) => (
                    <div
                      key={
                        detalle.id_detalle
                      }
                      className="panel-soft flex items-center justify-between p-4"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {
                            detalle
                              .producto
                              ?.nombre
                          }
                        </p>

                        <p className="text-sm text-slate-400">
                          {
                            detalle.cantidad
                          }{" "}
                          x $
                          {Number(
                            detalle.precio_unitario
                          ).toFixed(
                            2
                          )}
                        </p>
                      </div>

                      <p className="font-semibold text-white">
                        $
                        {Number(
                          detalle.subtotal
                        ).toFixed(
                          2
                        )}
                      </p>
                    </div>
                  )
                )
              ) : (
                <div className="panel-soft p-8 text-center text-slate-400">
                  La cuenta
                  todavía no tiene
                  productos.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmModal
        isOpen={
          confirmState.open
        }
        onClose={() =>
          setConfirmState({
            open: false,
            cuenta: null,
          })
        }
        onConfirm={removeCuenta}
        loading={loading}
        title="Eliminar cuenta"
        message="La cuenta y sus detalles se removerán del sistema. Si estaba abierta, el stock será revertido automáticamente."
      />
    </div>
  );
}

export default Cuentas;