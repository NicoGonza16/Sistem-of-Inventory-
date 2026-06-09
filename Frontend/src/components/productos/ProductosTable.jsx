import {
  FiEdit2,
  FiEye,
  FiTrash2,
} from "react-icons/fi";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Table from "../ui/Table";

function ProductosTable({
  paginated,
  filtered,
  productos,
  page,
  setPage,
  totalPages,
  openEdit,
  setPreviewImage,
  setConfirmState,
  isAdmin,
  placeholderImage,
}) {
  return (
    <Card>
      <Table
        columns={[
          {
            key: "nombre",
            title: "Producto",
            render: (row) => (
              <div className="flex items-center gap-3">
                <img
                  src={
                    row.imagenes?.[0]?.url_imagen
                      ? row.imagenes[0].url_imagen
                      : placeholderImage
                  }
                  alt={row.nombre}
                  className="size-14 rounded-2xl object-cover"
                />

                <div>
                  <p className="font-medium text-white">
                    {row.nombre}
                  </p>

                  <p className="text-xs text-slate-500">
                    {row.categoria?.nombre_categoria ||
                      "Sin categoría"}
                  </p>
                </div>
              </div>
            ),
          },

          {
            key: "precio_venta",
            title: "Precio",
            render: (row) =>
              `$${Number(row.precio_venta).toFixed(2)}`,
          },

          {
            key: "stock",
            title: "Stock",
            render: (row) => (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  Number(row.stock) <=
                  Number(row.stock_minimo)
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
                <Button
                  variant="secondary"
                  className="px-3 py-2"
                  icon={FiEdit2}
                  onClick={() => openEdit(row)}
                  aria-label={`Editar ${row.nombre}`}
                >
                  Editar
                </Button>

                <Button
                  variant="ghost"
                  className="px-3 py-2"
                  icon={FiEye}
                  aria-label={`Ver ${row.nombre}`}
                  onClick={() =>
                    setPreviewImage(
                      row.imagenes?.[0]?.url_imagen
                        ? row.imagenes[0].url_imagen
                        : placeholderImage
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
                    aria-label={`Eliminar ${row.nombre}`}
                    onClick={() =>
                      setConfirmState({
                        open: true,
                        type: "producto",
                        payload: row,
                      })
                    }
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
          <Button
            variant="ghost"
            disabled={page === 1}
            onClick={() =>
              setPage((value) => Math.max(1, value - 1))
            }
          >
            Anterior
          </Button>

          <Button
            variant="ghost"
            disabled={page === totalPages}
            onClick={() =>
              setPage((value) =>
                Math.min(totalPages, value + 1)
              )
            }
          >
            Siguiente
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ProductosTable;
