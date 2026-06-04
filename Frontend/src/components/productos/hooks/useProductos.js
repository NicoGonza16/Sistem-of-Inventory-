import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import toast from "react-hot-toast";

import useAsyncAction from "../../../hooks/useAsyncAction";

import { getCategorias } from "../../../services/categorias.service";

import {
  createProducto,
  deleteProducto,
  deleteProductoImagen,
  getProductos,
  updateProducto,
  updateProductoImagen,
  uploadProductoImagenes,
} from "../../../services/productos.service";

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
  </svg>
`);

function useProductos({
  inventoryMode,
  isAdmin,
}) {
  const [productos, setProductos] =
    useState([]);

  const [categorias, setCategorias] =
    useState([]);

  const [loadingPage, setLoadingPage] =
    useState(true);

  const [isOpen, setIsOpen] =
    useState(false);

  const [editing, setEditing] =
    useState(null);

  const [form, setForm] =
    useState(initialForm);

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [page, setPage] = useState(1);

  const [pendingFiles, setPendingFiles] =
    useState([]);

  const [previewImage, setPreviewImage] =
    useState(null);

  const [confirmState, setConfirmState] =
    useState({
      open: false,
      type: null,
      payload: null,
    });

  const imageToReplaceRef = useRef(null);

  const fileInputRef = useRef(null);

  const imageReplaceInputRef = useRef(null);

  const { execute, loading } =
    useAsyncAction();

  const pageSize = 7;

  const loadData = async () => {
    const [productosRes, categoriasRes] =
      await Promise.all([
        getProductos(),
        getCategorias(),
      ]);

    const nextProductos =
      productosRes.data || [];

    setProductos(nextProductos);

    setCategorias(
      categoriasRes.data || []
    );

    return nextProductos;
  };

  useEffect(() => {
    loadData().finally(() =>
      setLoadingPage(false)
    );
  }, []);

  useEffect(() => {
    return () => {
      pendingFiles.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(
            item.preview
          );
        }
      });
    };
  }, [pendingFiles]);

  const filtered = useMemo(() => {
    return productos.filter((item) => {
      const matchesSearch =
        (item.nombre || "")
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesCategory =
        categoryFilter === "all"
          ? true
          : String(item.id_categoria) ===
            String(categoryFilter);

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    productos,
    search,
    categoryFilter,
  ]);

  const paginated = useMemo(() => {
    const start =
      (page - 1) * pageSize;

    return filtered.slice(
      start,
      start + pageSize
    );
  }, [filtered, page]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length / pageSize
    )
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const productModalImages =
    editing
      ? [
          ...(editing.imagenes ||
            []),
          ...pendingFiles,
        ]
      : pendingFiles;

  const clearPendingFiles = () => {
    pendingFiles.forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(
          item.preview
        );
      }
    });

    setPendingFiles([]);
  };

  const closeModal = () => {
  pendingFiles.forEach((file) => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
  });

  setPendingFiles([]);
  setEditing(null);
  setForm(initialForm);
  setIsOpen(false);
    };

  const openCreate = () => {
    setEditing(null);

    setForm(initialForm);

    clearPendingFiles();

    setIsOpen(true);
  };

  const openEdit = (producto) => {
    setEditing(producto);

    setForm({
      nombre: producto.nombre,
      precio_venta:
        producto.precio_venta,
      stock: producto.stock,
      stock_minimo:
        producto.stock_minimo,
      id_categoria:
        producto.id_categoria,
    });

    clearPendingFiles();

    setIsOpen(true);
  };

  const handleSearchChange = (
    value
  ) => {
    setSearch(value);

    setPage(1);
  };

  const handleCategoryFilterChange = (
    value
  ) => {
    setCategoryFilter(value);

    setPage(1);
  };

  const handleFilesSelected = (
    files
  ) => {
    const nextFiles = [...files]
      .filter((file) =>
        file.type.startsWith(
          "image/"
        )
      )
      .map((file) => ({
        file,
        name: file.name,
        preview:
          URL.createObjectURL(file),
        isTemp: true,
      }));

    if (!nextFiles.length) {
      toast.error(
        "Solo se permiten imágenes."
      );
      return;
    }

    setPendingFiles((current) => [
      ...current,
      ...nextFiles,
    ]);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    handleFilesSelected(
      event.dataTransfer.files
    );
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (loading) return;

    if (!form.nombre.trim()) {
      toast.error(
        "Ingresa un nombre."
      );
      return;
    }

    if (!form.id_categoria) {
      toast.error(
        "Selecciona una categoría."
      );
      return;
    }

    if (
      Number(form.precio_venta) <= 0
    ) {
      toast.error(
        "Precio inválido."
      );
      return;
    }

    const payload = {
      ...form,
      precio_venta: Number(
        form.precio_venta
      ),
      stock: Number(form.stock),
      stock_minimo: Number(
        form.stock_minimo
      ),
      id_categoria: Number(
        form.id_categoria
      ),
    };

    await execute(
      async () => {
        let productId =
          editing?.id_producto;

        if (editing) {
          const updated =
            await updateProducto(
              editing.id_producto,
              payload
            );

          productId =
            updated.data
              ?.id_producto;
        } else {
          const created =
            await createProducto(
              payload
            );

          productId =
            created.data
              ?.id_producto;
        }

        if (
          pendingFiles.length &&
          productId
        ) {
          await uploadProductoImagenes(
            productId,
            pendingFiles.map(
              (item) =>
                item.file
            )
          );
        }

        await loadData();

        setPage(1);

        closeModal();
      },
      {
        successMessage: editing
          ? "Producto actualizado."
          : "Producto creado.",
      }
    );
  };

  const confirmDelete =
    async () => {
      if (loading) return;

      if (
        !confirmState.payload
      ) {
        return;
      }

      if (
        confirmState.type ===
        "producto"
      ) {
        await execute(
          async () => {
            await deleteProducto(
              confirmState.payload
                .id_producto
            );

            await loadData();

            setConfirmState({
              open: false,
              type: null,
              payload: null,
            });
          },
          {
            successMessage:
              "Producto eliminado.",
          }
        );
      }

      if (
        confirmState.type ===
        "imagen"
      ) {
        await execute(
          async () => {
            await deleteProductoImagen(
              confirmState.payload
                .id_imagen
            );

            const nextProductos =
              await loadData();

            const freshProduct =
              nextProductos.find(
                (item) =>
                  item.id_producto ===
                  editing?.id_producto
              );

            if (
              freshProduct
            ) {
              setEditing(
                freshProduct
              );
            }

            setConfirmState({
              open: false,
              type: null,
              payload: null,
            });
          },
          {
            successMessage:
              "Imagen eliminada.",
          }
        );
      }
    };

  const handleReplaceImage =
    async (event) => {
      if (loading) return;

      const file =
        event.target.files?.[0];

      if (
        !file ||
        !imageToReplaceRef.current
      ) {
        return;
      }

      await execute(
        async () => {
          await updateProductoImagen(
            imageToReplaceRef
              .current.id_imagen,
            file
          );

          const nextProductos =
            await loadData();

          const freshProduct =
            nextProductos.find(
              (item) =>
                item.id_producto ===
                editing?.id_producto
            );

          if (
            freshProduct
          ) {
            setEditing(
              freshProduct
            );
          }

          imageToReplaceRef.current =
            null;
        },
        {
          successMessage:
            "Imagen actualizada.",
        }
      );

      event.target.value = "";
    };

  return {
    inventoryMode,
    isAdmin,

    productos,
    categorias,

    loadingPage,
    loading,

    isOpen,
    setIsOpen,

    editing,
    setEditing,

    form,
    setForm,

    search,
    setSearch,

    categoryFilter,
    setCategoryFilter,

    page,
    setPage,

    paginated,
    filtered,

    totalPages,

    pendingFiles,

    previewImage,
    setPreviewImage,

    confirmState,
    setConfirmState,

    fileInputRef,
    imageReplaceInputRef,
    imageToReplaceRef,

    placeholderImage,

    productModalImages,

    openCreate,
    openEdit,
    closeModal,

    handleSearchChange,
    handleCategoryFilterChange,

    handleDrop,
    handleFilesSelected,
    handleSubmit,
    confirmDelete,
    handleReplaceImage,
  };
}

export default useProductos;
