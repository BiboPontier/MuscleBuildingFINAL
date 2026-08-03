import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Dumbbell, Flame, Target, CalendarRange, Library } from 'lucide-react';
import { listRoutines } from '@/lib/db';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import type { RoutineGoal, RoutineLevel } from '@/types';

const goalLabel: Record<RoutineGoal, string> = {
  hipertrofia: 'Hipertrofia',
  fuerza: 'Fuerza',
  resistencia: 'Resistencia',
  perdida_grasa: 'Pérdida de grasa',
  movilidad: 'Movilidad',
};

export function RoutinesPage() {
  const [goal, setGoal] = useState<'todos' | RoutineGoal>('todos');
  const [level, setLevel] = useState<'todos' | RoutineLevel>('todos');
  const routines = useQuery({ queryKey: ['routines'], queryFn: listRoutines });

  const filtered = useMemo(
    () => (routines.data ?? []).filter((r) => (goal === 'todos' || r.goal === goal) && (level === 'todos' || r.level === level)),
    [routines.data, goal, level]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-base-100">Rutinas</h2>
          <p className="text-sm text-base-400">Programas de entrenamiento listos para asignar a tus clientes</p>
        </div>
        <Link to="/app/rutinas/ejercicios" className="btn-secondary">
          <Library className="h-4 w-4" /> Biblioteca de ejercicios
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={goal} onChange={(e) => setGoal(e.target.value as typeof goal)} className="input-base w-auto">
          <option value="todos">Todos los objetivos</option>
          {Object.entries(goalLabel).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value as typeof level)} className="input-base w-auto">
          <option value="todos">Todos los niveles</option>
          <option value="principiante">Principiante</option>
          <option value="intermedio">Intermedio</option>
          <option value="avanzado">Avanzado</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {routines.isLoading
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          : filtered.map((r) => (
              <Link key={r.id} to={`/app/rutinas/${r.id}`} className="card p-5 space-y-4 hover:border-electric-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric-500/15 text-electric-400">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <Badge tone="electric">{goalLabel[r.goal]}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-base-100">{r.name}</h3>
                  <p className="text-sm text-base-400 mt-1 line-clamp-2">{r.description}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-base-400 pt-2 border-t border-base-800">
                  <span className="flex items-center gap-1.5">
                    <CalendarRange className="h-3.5 w-3.5" /> {r.days_per_week} días/sem
                  </span>
                  <span className="flex items-center gap-1.5 capitalize">
                    <Target className="h-3.5 w-3.5" /> {r.level}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5" /> {r.assigned_member_ids.length} asignados
                  </span>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
}
