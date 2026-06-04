import Card from "../ui/Card";

function ProductosStats({
  productos,
  filtered,
  isAdmin,
}) {
  return (
    <div
      className={`grid gap-4 ${
        isAdmin
          ? "md:grid-cols-3"
          : "md:grid-cols-2"
      }`}
    >
      <Card>
        <p className="text-sm text-slate-400">
          Productos visibles
        </p>

        <p className="mt-2 text-3xl font-semibold text-white">
          {filtered.length}
        </p>
      </Card>

      <Card>
        <p className="text-sm text-slate-400">
          Stock bajo
        </p>

        <p className="mt-2 text-3xl font-semibold text-amber-300">
          {
            productos.filter(
              (item) =>
                Number(item.stock) <=
                Number(item.stock_minimo)
            ).length
          }
        </p>
      </Card>

      {isAdmin && (
        <Card>
          <p className="text-sm text-slate-400">
            Valor estimado
          </p>

          <p className="mt-2 text-3xl font-semibold text-cyan-300">
            $
            {productos
              .reduce(
                (acc, item) =>
                  acc +
                  Number(item.stock || 0) *
                    Number(
                      item.precio_venta || 0
                    ),
                0
              )
              .toFixed(2)}
          </p>
        </Card>
      )}
    </div>
  );
}

export default ProductosStats;