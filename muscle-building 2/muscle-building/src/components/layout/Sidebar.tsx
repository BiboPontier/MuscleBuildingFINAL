import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  QrCode,
  Dumbbell,
  CalendarDays,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn, initials } from '@/lib/utils';

const nav = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/miembros', label: 'Miembros', icon: Users },
  { to: '/app/asistencia', label: 'Asistencia', icon: QrCode },
  { to: '/app/rutinas', label: 'Rutinas', icon: Dumbbell },
  { to: '/app/clases', label: 'Clases', icon: CalendarDays },
  { to: '/app/pagos', label: 'Pagos', icon: CreditCard },
];

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const { profile, logout } = useAuth();

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onCloseMobile} />}
      <aside
        className={cn(
          'fixed z-40 inset-y-0 left-0 w-64 flex flex-col border-r border-base-800 bg-base-950 transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-2 px-5 h-16 border-b border-base-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric-500 shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-bold tracking-tight text-base-100">Muscle Building</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-electric-500/15 text-electric-300' : 'text-base-400 hover:bg-base-800 hover:text-base-100'
                )
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/app/configuracion"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-electric-500/15 text-electric-300' : 'text-base-400 hover:bg-base-800 hover:text-base-100'
              )
            }
          >
            <Settings className="h-[18px] w-[18px]" />
            Configuración
          </NavLink>
        </nav>

        <div className="border-t border-base-800 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-base-800 text-xs font-semibold text-base-200">
              {initials(profile?.full_name ?? 'U')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-base-100">{profile?.full_name}</p>
              <p className="truncate text-xs text-base-400 capitalize">{profile?.role}</p>
            </div>
            <button onClick={logout} className="btn-ghost !px-2 !py-2" aria-label="Cerrar sesión" title="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
