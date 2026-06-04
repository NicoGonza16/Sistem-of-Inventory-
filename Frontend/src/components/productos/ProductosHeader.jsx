import {
  FiFilter,
  FiPlus,
  FiSearch,
} from "react-icons/fi";

import Button from "../ui/Button";
import Card from "../ui/Card";

function ProductosHeader({
  inventoryMode,
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  categorias,
  openCreate,
  isAdmin,
}) {
  return (
    <Card className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="text-sm text-slate-400">
          {inventoryMode
            ? "Control de inventario"
            : "Catálogo comercial"}
        </p>

        <h1 className="text-2xl font-semibold text-white">
          {inventoryMode
            ? "Inventario"
            : "Productos"}
        </h1>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-400">
          <FiSearch />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Buscar producto..."
            aria-label="Buscar producto"
            className="w-full bg-transparent text-sm text-slate-100 outline-none md:w-60"
          />
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-400">
          <FiFilter />

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
            className="bg-transparent text-sm text-slate-100 outline-none"
          >
            <option
              value="all"
              className="bg-slate-900 text-white"
            >
              Todas las categorías
            </option>

            {categorias.map((categoria) => (
              <option
                key={categoria.id_categoria}
                value={categoria.id_categoria}
                className="bg-slate-900 text-white"
              >
                {categoria.nombre_categoria}
              </option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <Button
            icon={FiPlus}
            onClick={openCreate}
          >
            Nuevo producto
          </Button>
        )}
      </div>
    </Card>
  );
}

export default ProductosHeader;