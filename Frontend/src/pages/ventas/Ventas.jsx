import { useEffect, useMemo, useState } from "react";
import { FiPlusCircle, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import useAsyncAction from "../../hooks/useAsyncAction";
import { createDetalleCuenta, deleteDetalleCuenta, getCuentas, updateCuenta } from "../../services/cuentas.service";
import { getProductos } from "../../services/productos.service";

function Ventas() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "admin";
  const [cuentas, setCuentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedCuentaId, setSelectedCuentaId] = useState("");
  const [selectedProductoId, setSelectedProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [loadingPage, setLoadingPage] = useState(true);
  const [confirmState, setConfirmState] = useState({ open: false, detalleId: null });
  const { execute, loading } = useAsyncAction();

  const loadData = async () => {
    const [cuentasRes, productosRes] = await Promise.all([getCuentas(), getProductos()]);
    setCuentas((cuentasRes.data || []).filter((item) => item.estado === "abierta"));
    setProductos((productosRes.data || []).filter((item) => item.estado));
  };

  useEffect(() => {
    loadData().finally(() => setLoadingPage(false));
  }, []);

  const selectedCuenta = useMemo(
    () => cuentas.find((item) => String(item.id_cuenta) === String(selectedCuentaId)),
    [cuentas, selectedCuentaId]
  );

  const selectedProducto = useMemo(
    () => productos.find((item) => String(item.id_producto) === String(selectedProductoId)),
    [productos, selectedProductoId]
  );

  const handleAddProduct = async () => {
    if (!selectedCuentaId || !selectedProductoId) return;

    await execute(
      async () => {
        await createDetalleCuenta({
          id_cuenta: Number(selectedCuentaId),
          id_producto: Number(selectedProductoId),
          cantidad: Number(cantidad),
          precio_unitario: Number(selectedProducto.precio_venta),
        });
        await loadData();
      },
      { successMessage: "Producto agregado a la cuenta." }
    );
  };

  const handleDeleteItem = async () => {
    if (!confirmState.detalleId) return;

    await execute(
      async () => {
        await deleteDetalleCuenta(confirmState.detalleId);
        await loadData();
        setConfirmState({ open: false, detalleId: null });
      },
      { successMessage: "Producto retirado de la cuenta." }
    );
  };

  const handleCloseSale = async () => {
    if (!selectedCuenta) return;

    await execute(
      async () => {
        await updateCuenta(selectedCuenta.id_cuenta, { estado: "cerrada" });
        setSelectedCuentaId("");
        await loadData();
      },
      { successMessage: "Venta cerrada correctamente." }
    );
  };

  if (loadingPage) return <Loader label="Preparando módulo POS..." />;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="space-y-5">
        <div>
          <p className="text-sm text-slate-400">POS en vivo</p>
          <h1 className="text-2xl font-semibold text-white">Ventas y consumo</h1>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">Cuenta activa</span>
          <select
            value={selectedCuentaId}
            onChange={(event) => setSelectedCuentaId(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
          >
            <option value="">Selecciona una cuenta abierta</option>
            {cuentas.map((cuenta) => (
              <option key={cuenta.id_cuenta} value={cuenta.id_cuenta}>
                Mesa {cuenta.mesa?.numero_mesa} - Cuenta #{cuenta.id_cuenta}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">Producto</span>
          <select
            value={selectedProductoId}
            onChange={(event) => setSelectedProductoId(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
          >
            <option value="">Selecciona un producto</option>
            {productos.map((producto) => (
              <option key={producto.id_producto} value={producto.id_producto}>
                {producto.nombre} - ${Number(producto.precio_venta).toFixed(2)}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">Cantidad</span>
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(event) => setCantidad(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
          />
        </label>

        <Button className="w-full" icon={FiPlusCircle} onClick={handleAddProduct} loading={loading}>
          Agregar producto
        </Button>

        {selectedProducto ? (
          <div className="panel-soft p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Vista previa</p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{selectedProducto.nombre}</p>
                <p className="text-sm text-slate-400">Stock disponible: {selectedProducto.stock}</p>
              </div>
              <p className="text-lg font-semibold text-cyan-300">
                ${(Number(selectedProducto.precio_venta) * Number(cantidad || 1)).toFixed(2)}
              </p>
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Detalle operativo</p>
            <h2 className="text-2xl font-semibold text-white">
              {selectedCuenta ? `Mesa ${selectedCuenta.mesa?.numero_mesa}` : "Selecciona una cuenta"}
            </h2>
          </div>
          <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
            <FiShoppingCart className="text-xl" />
          </div>
        </div>

        {selectedCuenta ? (
          <>
            <div className="space-y-3">
              {selectedCuenta.detalles?.length ? (
                selectedCuenta.detalles.map((detalle) => (
                  <div key={detalle.id_detalle} className="panel-soft flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-white">{detalle.producto?.nombre}</p>
                      <p className="text-sm text-slate-400">
                        {detalle.cantidad} x ${Number(detalle.precio_unitario).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-white">${Number(detalle.subtotal).toFixed(2)}</p>
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => setConfirmState({ open: true, detalleId: detalle.id_detalle })}
                          className="rounded-xl border border-rose-400/20 p-2 text-rose-300 transition hover:bg-rose-500/10"
                        >
                          <FiTrash2 />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="panel-soft p-10 text-center text-slate-400">Esta cuenta todavía no tiene productos.</div>
              )}
            </div>

            <div className="panel-soft flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-400">Total actual</p>
                <p className="mt-2 text-3xl font-semibold text-white">${Number(selectedCuenta.total).toFixed(2)}</p>
              </div>
              <Button onClick={handleCloseSale} loading={loading}>
                Cerrar venta
              </Button>
            </div>
          </>
        ) : (
          <div className="panel-soft p-10 text-center text-slate-400">
            Selecciona una cuenta abierta para empezar a agregar productos.
          </div>
        )}
      </Card>

      <ConfirmModal
        isOpen={confirmState.open}
        onClose={() => setConfirmState({ open: false, detalleId: null })}
        onConfirm={handleDeleteItem}
        loading={loading}
        title="Eliminar ítem de venta"
        message="El producto se retirará de la cuenta y el stock será restaurado automáticamente."
      />
    </div>
  );
}

export default Ventas;
