import { Menu, Search, Bell } from 'lucide-react';

export function Topbar({ onOpenMobile, title }: { onOpenMobile: () => void; title: string }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-base-800 bg-base-950/80 backdrop-blur px-4 lg:px-6">
      <button onClick={onOpenMobile} className="btn-ghost !px-2 !py-2 lg:hidden" aria-label="Abrir menú">
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="font-display text-lg font-semibold text-base-100 hidden sm:block">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-400" />
          <input placeholder="Buscar…" className="input-base w-64 pl-9" />
        </div>
        <button className="btn-ghost !px-2 !py-2 relative" aria-label="Notificaciones">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-electric-500" />
        </button>
      </div>
    </header>
  );
}
