import { useEffect, useMemo, useRef, useState } from "react";
import { FiEdit2, FiEye, FiFilter, FiPackage, FiPlus, FiSearch, FiTrash2, FiUploadCloud } from "react-icons/fi";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import { useAuth } from "../../context/AuthContext";
import useAsyncAction from "../../hooks/useAsyncAction";
import { getCategorias } from "../../services/categorias.service";
import {
  createProducto,
  deleteProducto,
  deleteProductoImagen,
  getProductos,
  updateProducto,
  updateProductoImagen,
  uploadProductoImagenes,
} from "../../services/productos.service";

const initialForm = {
  nombre: "",
  precio_venta: "",
  stock: "",
  stock_minimo: "",
  id_categoria: "",
};

const placeholderImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260">
      <rect width="400" height="260" fill="#0f172a"/>
      <rect x="24" y="24" width="352" height="212" rx="24" fill="#111827" stroke="#1e293b"/>
      <circle cx="148" cy="116" r="28" fill="#164e63"/>
      <path d="M72 196l74-68 54 48 42-38 86 58H72z" fill="#155e75"/>
      <text x="200" y="224" font-family="Arial" font-size="20" fill="#67e8f9" text-anchor="middle">BAR INVENTORY</text>
    </svg>
  `);

function Productos({ inventoryMode = false }) {
  const { user } = useAuth();
  const isAdmin = user?.rol === "admin";
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, type: null, payload: null });
  const [imageToReplace, setImageToReplace] = useState(null);
  const fileInputRef = useRef(null);
  const imageReplaceInputRef = useRef(null);
  const { execute, loading } = useAsyncAction();

  const pageSize = 7;

  const loadData = async () => {
    const [productosRes, categoriasRes] = await Promise.all([getProductos(), getCategorias()]);
    const nextProductos = productosRes.data || [];
    setProductos(nextProductos);
    setCategorias(categoriasRes.data || []);
    return nextProductos;
  };

  useEffect(() => {
    loadData().finally(() => setLoadingPage(false));
  }, []);

  const filtered = useMemo(() => {
    return productos.filter((item) => {
      const matchesSearch = item.nombre.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" ? true : String(item.id_categoria) === String(categoryFilter);
      return matchesSearch && matchesCategory;
    });
  }, [productos, search, categoryFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter]);

  const productModalImages = editing ? [...(editing.imagenes || []), ...pendingFiles] : pendingFiles;

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setPendingFiles([]);
    setIsOpen(true);
  };

  const openEdit = (producto) => {
    setEditing(producto);
    setForm({
      nombre: producto.nombre,
      precio_venta: producto.precio_venta,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      id_categoria: producto.id_categoria,
    });
    setPendingFiles([]);
    setIsOpen(true);
  };

  const handleFilesSelected = (files) => {
    const nextFiles = [...files]
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        file,
        name: file.name,
        preview: URL.createObjectURL(file),
        isTemp: true,
      }));

    if (!nextFiles.length) {
      toast.error("Solo se permiten imágenes.");
      return;
    }

    setPendingFiles((current) => [...current, ...nextFiles]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFilesSelected(event.dataTransfer.files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      precio_venta: Number(form.precio_venta),
      stock: Number(form.stock),
      stock_minimo: Number(form.stock_minimo),
      id_categoria: Number(form.id_categoria),
    };

    await execute(
      async () => {
        let productId = editing?.id_producto;

        if (editing) {
          const updated = await updateProducto(editing.id_producto, payload);
          productId = updated.data.id_producto;
        } else {
          const created = await createProducto(payload);
          productId = created.data.id_producto;
        }

        if (pendingFiles.length && productId) {
          await uploadProductoImagenes(
            productId,
            pendingFiles.map((item) => item.file)
          );
        }

        await loadData();
        setPendingFiles([]);
        setIsOpen(false);
      },
      { successMessage: editing ? "Producto actualizado." : "Producto creado." }
    );
  };

  const confirmDelete = async () => {
    if (!confirmState.payload) return;

    if (confirmState.type === "producto") {
      await execute(
        async () => {
          await deleteProducto(confirmState.payload.id_producto);
          await loadData();
          setConfirmState({ open: false, type: null, payload: null });
        },
        { successMessage: "Producto eliminado." }
      );
    }

    if (confirmState.type === "imagen") {
      await execute(
        async () => {
          await deleteProductoImagen(confirmState.payload.id_imagen);
          const nextProductos = await loadData();
          const freshProduct = nextProductos.find((item) => item.id_producto === editing?.id_producto);
          if (freshProduct) setEditing(freshProduct);
          setConfirmState({ open: false, type: null, payload: null });
        },
        { successMessage: "Imagen eliminada." }
      );
    }
  };

  const handleReplaceImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !imageToReplace) return;

    await execute(
      async () => {
        await updateProductoImagen(imageToReplace.id_imagen, file);
        const nextProductos = await loadData();
        const freshProduct = nextProductos.find((item) => item.id_producto === editing?.id_producto);
        if (freshProduct) setEditing(freshProduct);
        setImageToReplace(null);
      },
      { successMessage: "Imagen actualizada." }
    );

    event.target.value = "";
  };

  if (loadingPage) return <Loader label="Sincronizando productos..." />;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm text-slate-400">{inventoryMode ? "Control de inventario" : "Catálogo comercial"}</p>
          <h1 className="text-2xl font-semibold text-white">{inventoryMode ? "Inventario" : "Productos"}</h1>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-400">
            <FiSearch />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto..."
              className="w-full bg-transparent text-sm text-slate-100 outline-none md:w-60"
            />
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-400">
            <FiFilter />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="bg-transparent text-sm text-slate-100 outline-none"
            >
              <option value="all">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nombre_categoria}
                </option>
              ))}
            </select>
          </div>
          <Button icon={FiPlus} onClick={openCreate}>
            Nuevo producto
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-400">Productos visibles</p>
          <p className="mt-2 text-3xl font-semibold text-white">{filtered.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Stock bajo</p>
          <p className="mt-2 text-3xl font-semibold text-amber-300">
            {productos.filter((item) => Number(item.stock) <= Number(item.stock_minimo)).length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Valor estimado</p>
          <p className="mt-2 text-3xl font-semibold text-cyan-300">
            $
            {productos
              .reduce((acc, item) => acc + Number(item.stock || 0) * Number(item.precio_venta || 0), 0)
              .toFixed(2)}
          </p>
        </Card>
      </div>

      <Card>
        <Table
          columns={[
            {
              key: "nombre",
              title: "Producto",
              render: (row) => (
                <div className="flex items-center gap-3">
                  <img
                    src={row.imagenes?.[0]?.url_imagen ? `http://localhost:3001${row.imagenes[0].url_imagen}` : placeholderImage}
                    alt={row.nombre}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                  <div>
                    <p className="font-medium text-white">{row.nombre}</p>
                    <p className="text-xs text-slate-500">{row.categoria?.nombre_categoria || "Sin categoría"}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "precio_venta",
              title: "Precio",
              render: (row) => `$${Number(row.precio_venta).toFixed(2)}`,
            },
            {
              key: "stock",
              title: "Stock",
              render: (row) => (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    Number(row.stock) <= Number(row.stock_minimo)
                      ? "bg-amber-500/15 text-amber-300"
                      : "bg-emerald-500/15 text-emerald-300"
                  }`}
                >
                  {row.stock} uds
                </span>
              ),
            },
            {
              key: "imagenes",
              title: "Imágenes",
              render: (row) => row.imagenes?.length || 0,
            },
            {
              key: "actions",
              title: "Acciones",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" className="px-3 py-2" icon={FiEdit2} onClick={() => openEdit(row)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-3 py-2"
                    icon={FiEye}
                    onClick={() =>
                      setPreviewImage(
                        row.imagenes?.[0]?.url_imagen ? `http://localhost:3001${row.imagenes[0].url_imagen}` : placeholderImage
                      )
                    }
                  >
                    Ver
                  </Button>
                  {isAdmin ? (
                    <Button
                      variant="danger"
                      className="px-3 py-2"
                      icon={FiTrash2}
                      onClick={() => setConfirmState({ open: true, type: "producto", payload: row })}
                    >
                      Eliminar
                    </Button>
                  ) : null}
                </div>
              ),
            },
          ]}
          data={paginated}
          emptyMessage="No hay productos que coincidan con tus filtros."
        />
        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Anterior
            </Button>
            <Button
              variant="ghost"
              disabled={page === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Editar producto" : "Nuevo producto"} size="max-w-4xl">
        <form className="grid gap-6 lg:grid-cols-[1fr_1.1fr]" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Nombre"
              value={form.nombre}
              onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
            />
            <Input
              label="Precio de venta"
              type="number"
              min="0"
              step="0.01"
              value={form.precio_venta}
              onChange={(event) => setForm((current) => ({ ...current, precio_venta: event.target.value }))}
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
            />
            <Input
              label="Stock mínimo"
              type="number"
              min="0"
              value={form.stock_minimo}
              onChange={(event) => setForm((current) => ({ ...current, stock_minimo: event.target.value }))}
            />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">Categoría</span>
              <select
                value={form.id_categoria}
                onChange={(event) => setForm((current) => ({ ...current, id_categoria: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id_categoria} value={categoria.id_categoria}>
                    {categoria.nombre_categoria}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-cyan-400/30 bg-slate-950/50 p-6 text-center transition hover:border-cyan-300/50 hover:bg-slate-900/60"
            >
              <FiUploadCloud className="mb-3 text-3xl text-cyan-300" />
              <p className="font-medium text-white">Arrastra imágenes aquí o haz clic para subir</p>
              <p className="mt-2 text-sm text-slate-400">Puedes cargar múltiples imágenes por producto.</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFilesSelected(event.target.files)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {productModalImages.length ? (
                productModalImages.map((image, index) => {
                  const src = image.url_imagen ? `http://localhost:3001${image.url_imagen}` : image.preview;

                  return (
                    <div key={image.id_imagen || `${image.name}-${index}`} className="panel-soft overflow-hidden">
                      <img src={src || placeholderImage} alt="Producto" className="h-36 w-full object-cover" />
                      <div className="flex items-center justify-between p-3">
                        <button
                          type="button"
                          onClick={() => setPreviewImage(src || placeholderImage)}
                          className="text-sm text-cyan-300 transition hover:text-cyan-200"
                        >
                          Vista previa
                        </button>
                        {!image.isTemp && isAdmin ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setImageToReplace(image);
                                imageReplaceInputRef.current?.click();
                              }}
                              className="text-sm text-slate-300 transition hover:text-white"
                            >
                              Reemplazar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmState({ open: true, type: "imagen", payload: image })}
                              className="text-sm text-rose-300 transition hover:text-rose-200"
                            >
                              Eliminar
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="panel-soft flex min-h-36 items-center justify-center p-6 text-center text-sm text-slate-400 sm:col-span-2">
                  Este producto aún no tiene imágenes. Se mostrará una imagen por defecto.
                </div>
              )}
            </div>
            <input
              ref={imageReplaceInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleReplaceImage}
            />
          </div>

          <div className="flex justify-end gap-3 lg:col-span-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              {editing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(previewImage)} onClose={() => setPreviewImage(null)} title="Vista previa de imagen" size="max-w-3xl">
        <img src={previewImage || placeholderImage} alt="Vista previa" className="max-h-[70vh] w-full rounded-3xl object-cover" />
      </Modal>

      <ConfirmModal
        isOpen={confirmState.open}
        onClose={() => setConfirmState({ open: false, type: null, payload: null })}
        onConfirm={confirmDelete}
        loading={loading}
        title={confirmState.type === "imagen" ? "Eliminar imagen" : "Eliminar producto"}
        message={
          confirmState.type === "imagen"
            ? "La imagen se eliminará del producto de forma permanente."
            : `Se eliminará el producto "${confirmState.payload?.nombre || ""}" del sistema.`
        }
      />
    </div>
  );
}

export default Productos;
