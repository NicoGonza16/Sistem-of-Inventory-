import ProductoUploadZone from "./ProductoUploadZone";
import ProductoImagenGallery from "./ProductoImagenGallery";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";

function ProductoFormModal({
  isOpen,
  closeModal,
  editing,
  handleSubmit,
  form,
  setForm,
  categorias,
  handleDrop,
  handleFilesSelected,
  productModalImages,
  setPreviewImage,
  setConfirmState,
  imageReplaceInputRef,
  fileInputRef,
  handleReplaceImage,
  placeholderImage,
  isAdmin,
  loading,
  imageToReplaceRef,
}) {
  console.log("closeModal:", closeModal);
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={
        editing
          ? "Editar producto"
          : "Nuevo producto"
      }
      size="max-w-4xl"
    >
      <form
        className="grid gap-6 lg:grid-cols-[1fr_1.1fr]"
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={form.nombre || ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                nombre: event.target.value,
              }))
            }
          />

          <Input
            label="Precio de venta"
            type="number"
            min="0"
            step="0.01"
            value={form.precio_venta || ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                precio_venta: event.target.value,
              }))
            }
          />

          <Input
            label="Stock"
            type="number"
            min="0"
            value={form.stock || ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                stock: event.target.value,
              }))
            }
          />

          <Input
            label="Stock mínimo"
            type="number"
            min="0"
            value={form.stock_minimo || ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                stock_minimo: event.target.value,
              }))
            }
          />

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300">
              Categoría
            </span>

            <select
              value={form.id_categoria || ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  id_categoria:
                    event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
            >
              <option value="">
                Selecciona una categoría
              </option>

              {(categorias || []).map((categoria) => (
                  <option
                    key={
                      categoria.id_categoria
                    }
                    value={
                      categoria.id_categoria
                    }
                  >
                    {
                      categoria.nombre_categoria
                    }
                  </option>
                )
              )}
            </select>
          </label>
        </div>

        <div className="space-y-4">
          <ProductoUploadZone
            fileInputRef={fileInputRef}
            handleDrop={handleDrop}
            handleFilesSelected={
              handleFilesSelected
            }
          />

          <ProductoImagenGallery
            images={
              productModalImages || []
            }
            isAdmin={isAdmin}
            placeholderImage={
              placeholderImage
            }
            onPreview={setPreviewImage}
            onReplace={(image) => {
              imageToReplaceRef.current =
                image;

              imageReplaceInputRef.current?.click();
            }}
            onDelete={(image) =>
              setConfirmState({
                open: true,
                type: "imagen",
                payload: image,
              })
            }
          />

          <input
            ref={imageReplaceInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="Reemplazar imagen del producto"
            onChange={handleReplaceImage}
          />
        </div>

        <div className="flex justify-end gap-3 lg:col-span-2">
          <Button
            type="button"
            variant="ghost"
            onClick={closeModal}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            loading={loading}
            disabled={
            !form.nombre?.trim() ||
            !form.id_categoria ||
            form.precio_venta === "" ||
            form.stock === "" ||
            form.stock_minimo === "" ||
            Number(form.precio_venta) <= 0 ||
            Number(form.stock) < 0 ||
            Number(form.stock_minimo) < 0
          }
          >
            {editing
              ? "Guardar cambios"
              : "Crear producto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ProductoFormModal;