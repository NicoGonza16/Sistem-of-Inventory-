import { FiBell, FiMenu, FiSearch } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

function Navbar({ onOpenSidebar }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 mb-6 flex flex-col gap-4 panel px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-2xl border border-white/10 p-3 text-slate-300 transition hover:bg-white/5 lg:hidden"
        >
          <FiMenu />
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Operaciones en vivo</p>
          <h2 className="text-2xl font-semibold text-white">Panel administrativo</h2>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-400">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar productos, mesas o cuentas..."
            className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500 md:w-80"
          />
        </div>
        <button
          type="button"
          className="relative rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-slate-300 transition hover:bg-white/5"
        >
          <FiBell />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-400" />
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-semibold text-slate-950">
            {user?.nombre?.slice(0, 2)?.toUpperCase() || "BI"}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{user?.nombre || "Usuario"}</p>
            <p className="text-xs text-slate-400">{user?.rol || "rol"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
