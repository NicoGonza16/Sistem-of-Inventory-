import { motion } from "framer-motion";
import {
  FiBarChart2,
  FiBox,
  FiClipboard,
  FiGrid,
  FiLayers,
  FiLogOut,
  FiMenu,
  FiShoppingCart,
  FiTag,
  FiX,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/productos", label: "Productos", icon: FiBox },
  { to: "/categorias", label: "Categorías", icon: FiTag },
  { to: "/inventario", label: "Inventario", icon: FiLayers },
  { to: "/mesas", label: "Mesas", icon: FiGrid },
  { to: "/cuentas", label: "Cuentas", icon: FiClipboard },
  { to: "/ventas", label: "Ventas", icon: FiShoppingCart },
  { to: "/reportes", label: "Reportes", icon: FiBarChart2 },
];

function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/70 lg:hidden"
          onClick={onMobileClose}
        />
      ) : null}

      <motion.aside
        animate={{ width: collapsed ? 96 : 280 }}
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/10 bg-slate-950/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className={collapsed ? "hidden" : "block"}>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Bar OS</p>
            <h1 className="text-xl font-semibold text-white">Control Center</h1>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="hidden rounded-2xl border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 lg:block"
          >
            <FiMenu />
          </button>
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-2xl border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 lg:hidden"
          >
            <FiX />
          </button>
        </div>

        <div className="px-4">
          <div className="panel-soft flex items-center gap-3 p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/20 text-sm font-semibold text-cyan-300">
              {user?.nombre?.slice(0, 2)?.toUpperCase() || "BI"}
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user?.nombre || "Invitado"}</p>
                <p className="truncate text-xs text-slate-400">{user?.rol || "Sin rol"}</p>
              </div>
            ) : null}
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon className="text-lg" />
              {!collapsed ? <span>{item.label}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="p-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
          >
            <FiLogOut />
            {!collapsed ? <span>Cerrar sesión</span> : null}
          </button>
        </div>
      </motion.aside>
    </>
  );
}

export default Sidebar;
