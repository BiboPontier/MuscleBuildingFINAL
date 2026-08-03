import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const titleByPath: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/miembros': 'Miembros',
  '/app/asistencia': 'Control de asistencia',
  '/app/rutinas': 'Rutinas y ejercicios',
  '/app/clases': 'Clases grupales',
  '/app/pagos': 'Pagos',
  '/app/configuracion': 'Configuración',
};

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = titleByPath[location.pathname] ?? 'Muscle Building';

  return (
    <div className="flex min-h-screen bg-base-950">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenMobile={() => setMobileOpen(true)} title={title} />
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
