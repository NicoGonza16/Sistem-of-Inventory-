import { FiMenu } from "react-icons/fi";

function Navbar({ onOpenSidebar }) {
  return (
    <header className="sticky top-0 z-20 mb-6 flex items-center justify-between panel p-5 lg:justify-center relative">
      
      {/* Botón del menú lateral (fijo a la izquierda en móviles/tablets) */}
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Abrir menú lateral"
        className="absolute left-5 rounded-2xl border border-white/10 p-3 text-slate-300 transition hover:bg-white/5 lg:hidden"
      >
        <FiMenu />
      </button>

      {/* Texto Central */}
      <div className="text-center w-full">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
          Operaciones en vivo
        </p>
        <h2 className="text-2xl font-semibold text-white">
          Panel administrativo
        </h2>
      </div>

    </header>
  );
}

export default Navbar;