import { useEffect, useState } from "react";
import { FiCheckCircle, FiCoffee, FiPlus, FiTrash2 } from "react-icons/fi";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import useAsyncAction from "../../hooks/useAsyncAction";
import { createCuenta, getCuentas, updateCuenta } from "../../services/cuentas.service";
import { createMesa, deleteMesa, getMesas } from "../../services/mesas.service";

function Mesas() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "admin";
  const [mesas, setMesas] = useState();
  const [cuentas, setCuentas] = useState();
  const [loadingPage, setLoadingPage] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [numeroMesa, setNumeroMesa] = useState("");
  const [confirmState, setConfirmState] = useState({ open: false, mesa: null });
  const { execute, loading } = useAsyncAction();

  const loadData = async () => {
    const [mesasRes, cuentasRes] = await Promise.all([getMesas(), getCuentas()]);
    setMesas(mesasRes.data || []);
    setCuentas(cuentasRes.data || []);
  };

  useEffect(() => {
    loadData().finally(() => setLoadingPage(false));
  }, []);

  const handleCreateMesa = async (event) => {
    event.preventDefault();
    await execute(
      async () => {
        await createMesa({ numero_mesa: Number(numeroMesa) });
        setNumeroMesa("");
        setIsOpen(false);
        await loadData();
      },
      { successMessage: "Mesa creada correctamente." }
    );
  };

  const handleOpenCuenta = async (mesa) => {
    await execute(
      async () => {
        await createCuenta({ id_mesa: mesa.id_mesa, id_empleado: user.id_usuario });
        await loadData();
      },
      { successMessage: `Cuenta abierta para mesa ${mesa.numero_mesa}.` }
    );
  };

  const handleCloseCuenta = async (cuenta) => {
    await execute(
      async () => {
        await updateCuenta(cuenta.id_cuenta, { estado: "cerrada" });
        await loadData();
      },
      { successMessage: `Cuenta de mesa ${cuenta.mesa?.numero_mesa} cerrada.` }
    );
  };

  const handleDeleteMesa = async () => {
    if (!confirmState.mesa) return;

    await execute(
      async () => {
        await deleteMesa(confirmState.mesa.id_mesa);
        await loadData();
        setConfirmState({ open: false, mesa: null });
      },
      { successMessage: "Mesa eliminada." }
    );
  };

  if (loadingPage || !mesas || !cuentas) {
  return <Loader label="Cargando mapa de mesas..." />;
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-400">Vista POS</p>
          <h1 className="text-2xl font-semibold text-white">Mesas</h1>
        </div>
        {isAdmin && (
          <Button
            icon={FiPlus}
            onClick={() => setIsOpen(true)}
          >
            Agregar mesa
          </Button>
        )}
      </Card>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {mesas?.map((mesa) => {
          const cuentaAbierta = cuentas.find((item) => item.id_mesa === mesa.id_mesa && item.estado === "abierta");
          const occupied = mesa.estado === "ocupada";

          return (
            <Card key={mesa.id_mesa} className={`border ${occupied ? "border-cyan-400/30" : "border-emerald-400/20"} overflow-hidden`}>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Mesa</p>
                  <h3 className="text-3xl font-semibold text-white">{mesa.numero_mesa}</h3>
                </div>
                <div
                  className={`rounded-2xl p-3 ${
                    occupied ? "bg-cyan-500/15 text-cyan-300" : "bg-emerald-500/15 text-emerald-300"
                  }`}
                >
                  {occupied ? <FiCoffee className="text-xl" /> : <FiCheckCircle className="text-xl" />}
                </div>
              </div>

              <div className="mb-6 flex items-center justify-between rounded-2xl bg-slate-950/50 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estado</p>
                  <p className={`mt-2 font-medium ${occupied ? "text-cyan-300" : "text-emerald-300"}`}>
                    {occupied ? "Ocupada" : "Libre"}
                  </p>
                </div>
                {cuentaAbierta ? (
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Cuenta activa</p>
                    <p className="mt-2 text-lg font-semibold text-white">${Number(cuentaAbierta.total).toFixed(2)}</p>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                {cuentaAbierta ? (
                  <Button variant="secondary" className="w-full" onClick={() => handleCloseCuenta(cuentaAbierta)}>
                    Cerrar cuenta
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => handleOpenCuenta(mesa)}>
                    Abrir cuenta
                  </Button>
                )}
                {isAdmin ? (
                  <Button
                    variant="danger"
                    className="w-full"
                    icon={FiTrash2}
                    onClick={() => setConfirmState({ open: true, mesa })}
                  >
                    Eliminar mesa
                  </Button>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Agregar mesa" size="max-w-lg">
        <form className="space-y-5" onSubmit={handleCreateMesa}>
          <Input
            label="Número de mesa"
            type="number"
            min="1"
            value={numeroMesa}
            onChange={(event) => setNumeroMesa(event.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Crear mesa
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmState.open}
        onClose={() => setConfirmState({ open: false, mesa: null })}
        onConfirm={handleDeleteMesa}
        loading={loading}
        title="Eliminar mesa"
        message={`La mesa ${confirmState.mesa?.numero_mesa || ""} se eliminará si no tiene cuentas activas asociadas.`}
      />
    </div>
  );
}

export default Mesas;
