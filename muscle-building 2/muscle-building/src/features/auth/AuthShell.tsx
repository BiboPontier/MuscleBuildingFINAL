import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, ShieldCheck, TrendingUp } from 'lucide-react';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-base-950">
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 border-r border-base-800">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(37,99,255,0.25), transparent 45%), radial-gradient(circle at 80% 70%, rgba(37,99,255,0.15), transparent 40%)',
          }}
        />
        <div className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-electric-500 shadow-glow">
            <Dumbbell className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">Muscle Building</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative space-y-6"
        >
          <h2 className="font-display text-4xl font-bold leading-tight text-base-100 max-w-md">
            La plataforma que pone tu gimnasio en piloto automático.
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-electric-400 mt-0.5" />
              <p className="text-sm text-base-300">Ingresos, asistencia y renovaciones en un solo panel, en tiempo real.</p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-electric-400 mt-0.5" />
              <p className="text-sm text-base-300">Roles y permisos claros para administración, entrenadores y recepción.</p>
            </div>
          </div>
        </motion.div>

        <p className="relative text-xs text-base-500">© {new Date().getFullYear()} Muscle Building. Todos los derechos reservados.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="space-y-1.5 lg:hidden flex flex-col items-center text-center mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-electric-500 shadow-glow mb-2">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="space-y-1.5 text-center lg:text-left">
            <h1 className="font-display text-2xl font-bold text-base-100">{title}</h1>
            <p className="text-sm text-base-400">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
