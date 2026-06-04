import { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import { useAuth } from "../../context/AuthContext";
import useAsyncAction from "../../hooks/useAsyncAction";
import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from "../../services/categorias.service";

const initialForm = { nombre_categoria: "" };

function Categorias() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "admin";
  const [categorias, setCategorias] = useState();
  const [loadingPage, setLoadingPage] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [confirmState, setConfirmState] = useState({ open: false, categoria: null });
  const { execute, loading } = useAsyncAction();

  const loadCategorias = async () => {
    const response = await getCategorias();
    setCategorias(response.data || []);
  };

  useEffect(() => {
    loadCategorias().finally(() => setLoadingPage(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setIsOpen(true);
  };

  const openEdit = (categoria) => {
    setEditing(categoria);
    setForm({ nombre_categoria: categoria.nombre_categoria });
    setIsOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await execute(
      async () => {
        if (editing) {
          await updateCategoria(editing.id_categoria, form);
        } else {
          await createCategoria(form);
        }
        await loadCategorias();
        setIsOpen(false);
      },
      { successMessage: editing ? "Categoría actualizada." : "Categoría creada." }
    );
  };

  const confirmDelete = async () => {
    if (!confirmState.categoria) return;

    await execute(
      async () => {
        await deleteCategoria(confirmState.categoria.id_categoria);
        await loadCategorias();
        setConfirmState({ open: false, categoria: null });
      },
      { successMessage: "Categoría eliminada." }
    );
  };

  if (loadingPage || !categorias) {
  return (
    <Loader label="Cargando categorías..." />
  );
}

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-400">Gestión base</p>
          <h1 className="text-2xl font-semibold text-white">Categorías</h1>
        </div>
        <Button icon={FiPlus} onClick={openCreate}>
          Nueva categoría
        </Button>
      </Card>

      <Card>
        <Table
          columns={[
            { key: "nombre_categoria", title: "Nombre" },
            {
              key: "productos",
              title: "Productos",
              render: (row) => row.productos?.length || 0,
            },
            {
              key: "actions",
              title: "Acciones",
              render: (row) => (
                <div className="flex gap-2">
                  <Button variant="secondary" className="px-3 py-2" icon={FiEdit2} onClick={() => openEdit(row)}>
                    Editar
                  </Button>
                  {isAdmin ? (
                    <Button
                      variant="danger"
                      className="px-3 py-2"
                      icon={FiTrash2}
                      onClick={() => setConfirmState({ open: true, categoria: row })}
                    >
                      Eliminar
                    </Button>
                  ) : null}
                </div>
              ),
            },
          ]}
          data={categorias || []}
          emptyMessage="Aún no hay categorías registradas."
        />
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Editar categoría" : "Nueva categoría"}>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Nombre de la categoría"
            value={form.nombre_categoria}
            onChange={(event) => setForm({ nombre_categoria: event.target.value })}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              {editing ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmState.open}
        onClose={() => setConfirmState({ open: false, categoria: null })}
        onConfirm={confirmDelete}
        loading={loading}
        title="Eliminar categoría"
        message={`Se eliminará la categoría "${confirmState.categoria?.nombre_categoria || ""}".`}
      />
    </div>
  );
}

export default Categorias;
