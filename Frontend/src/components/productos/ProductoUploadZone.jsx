import { FiUploadCloud } from "react-icons/fi";

function ProductoUploadZone({
  fileInputRef,
  handleDrop,
  handleFilesSelected,
}) {
  return (
    <button
      type="button"
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
      onClick={() => fileInputRef.current?.click()}
      className="flex min-h-44 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-cyan-400/30 bg-slate-950/50 p-6 text-center transition hover:border-cyan-300/50 hover:bg-slate-900/60"
    >
      <FiUploadCloud className="mb-3 text-3xl text-cyan-300" />

      <p className="font-medium text-white">
        Arrastra imágenes aquí o haz clic para subir
      </p>

      <p className="mt-2 text-sm text-slate-400">
        Puedes cargar múltiples imágenes por producto.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        aria-label="Subir imágenes del producto"
        onChange={(event) =>
          handleFilesSelected(event.target.files)
        }
      />
    </button>
  );
}

export default ProductoUploadZone;
