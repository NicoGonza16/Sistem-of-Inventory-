import { useAuth } from "../../context/AuthContext";

import useProductos from "../../components/productos/hooks/useProductos";

import ProductosHeader from "../../components/productos/ProductosHeader";
import ProductosStats from "../../components/productos/ProductosStats";
import ProductosTable from "../../components/productos/ProductosTable";

import ProductoFormModal from "../../components/productos/ProductoFormModal";
import ProductoPreviewModal from "../../components/productos/ProductoPreviewModal";

import ConfirmModal from "../../components/ui/ConfirmModal";
import Loader from "../../components/ui/Loader";

function Productos({
  inventoryMode = false,
}) {
  const { user } = useAuth();

  const state = useProductos({
    inventoryMode,
    isAdmin:
      user?.rol === "admin",
  });

  const closeConfirmModal = () => {
    state.setConfirmState({
      open: false,
      type: null,
      payload: null,
    });
  };

  if (state.loadingPage) {
    return (
      <Loader label="Sincronizando productos..." />
    );
  }

  return (
    <div className="space-y-6">
      <ProductosHeader
        inventoryMode={inventoryMode}
        search={state.search}
        setSearch={state.setSearch}
        categoryFilter={
          state.categoryFilter
        }
        setCategoryFilter={
          state.setCategoryFilter
        }
        categorias={
          state.categorias
        }
        openCreate={
          state.openCreate
        }
        isAdmin={
          state.isAdmin
        }
      />

      <ProductosStats
        productos={state.productos}
        filtered={state.filtered}
        isAdmin={state.isAdmin}
      />

      <ProductosTable
        paginated={
          state.paginated
        }
        page={state.page}
        totalPages={
          state.totalPages
        }
        setPage={
          state.setPage
        }
        placeholderImage={
          state.placeholderImage
        }
        openEdit={
          state.openEdit
        }
        setPreviewImage={
          state.setPreviewImage
        }
        setConfirmState={
          state.setConfirmState
        }
        isAdmin={
          state.isAdmin
        }
      />

      <ProductoFormModal
        isOpen={state.isOpen}
        closeModal={state.closeModal}
        editing={state.editing}
        handleSubmit={state.handleSubmit}
        form={state.form}
        setForm={state.setForm}
        categorias={state.categorias}
        handleDrop={state.handleDrop}
        handleFilesSelected={state.handleFilesSelected}
        productModalImages={state.productModalImages}
        setPreviewImage={state.setPreviewImage}
        setConfirmState={state.setConfirmState}
        imageReplaceInputRef={state.imageReplaceInputRef}
        fileInputRef={state.fileInputRef}
        handleReplaceImage={state.handleReplaceImage}
        placeholderImage={state.placeholderImage}
        isAdmin={state.isAdmin}
        loading={state.loading}
        imageToReplaceRef={state.imageToReplaceRef}
      />

      <ProductoPreviewModal
        previewImage={
          state.previewImage
        }
        setPreviewImage={
          state.setPreviewImage
        }
        placeholderImage={
          state.placeholderImage
        }
      />

      <ConfirmModal
        isOpen={
          state.confirmState.open
        }
        onClose={
          closeConfirmModal
        }
        onConfirm={
          state.confirmDelete
        }
        loading={
          state.loading
        }
        title={
          state.confirmState
            .type === "imagen"
            ? "Eliminar imagen"
            : "Eliminar producto"
        }
        message={
          state.confirmState
            .type === "imagen"
            ? "La imagen se eliminará del producto de forma permanente."
            : `Se eliminará el producto "${
                state
                  .confirmState
                  .payload
                  ?.nombre || ""
              }" del sistema.`
        }
      />
    </div>
  );
}

export default Productos;