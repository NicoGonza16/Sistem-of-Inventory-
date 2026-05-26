import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-grid-radial bg-grid">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "lg:pl-24" : "lg:pl-72"}`}>
        <main className="p-4 md:p-6 lg:p-8">
          <Navbar onOpenSidebar={() => setMobileOpen(true)} />
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
