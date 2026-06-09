function ProductoImagenGallery({
  images = [],
  isAdmin,
  onPreview,
  onReplace,
  onDelete,
  placeholderImage,
}) {
  const API_BASE = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:3001/api"
  ).replace("/api", "");

  console.log("API_BASE:", API_BASE);
  console.log("URL GUARDADA:", image?.url_imagen);
  console.log("URL FINAL:", imageSrc);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {images.length > 0 ? (
        images.map((image, index) => {
          const imageSrc =
            image?.url_imagen
              ? image.url_imagen.startsWith("http")
                ? image.url_imagen
                : `${API_BASE}${image.url_imagen}`
              : image?.preview || placeholderImage;

          console.log(
            "Imagen:",
            image
          );

          console.log(
            "URL generada:",
            imageSrc
          );

          return (
            <div
              key={
                image?.id_imagen ||
                image?.id ||
                `${image?.name || "image"}-${index}`
              }
              className="panel-soft overflow-hidden"
            >
              <img
                src={imageSrc}
                alt={
                  image?.name ||
                  "Imagen del producto"
                }
                loading="lazy"
                className="h-36 w-full object-cover"
                onError={(event) => {
                  console.error(
                    "Error cargando imagen:",
                    imageSrc
                  );

                  event.currentTarget.src =
                    placeholderImage;
                }}
              />

              <div className="flex items-center justify-between p-3">
                <button
                  type="button"
                  onClick={() =>
                    onPreview(imageSrc)
                  }
                  className="text-sm text-cyan-300 transition hover:text-cyan-200"
                >
                  Vista previa
                </button>

                {!image?.isTemp &&
                isAdmin ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onReplace(image)
                      }
                      className="text-sm text-slate-300 transition hover:text-white"
                    >
                      Reemplazar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onDelete(image)
                      }
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
          Este producto aún no tiene imágenes.
          Se mostrará una imagen por defecto.
        </div>
      )}
    </div>
  );
}

export default ProductoImagenGallery;