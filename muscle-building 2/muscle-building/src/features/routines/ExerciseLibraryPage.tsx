import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Search } from 'lucide-react';
import { listExercises } from '@/lib/db';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { Exercise, ExerciseDifficulty } from '@/types';

const difficultyTone: Record<ExerciseDifficulty, 'success' | 'warning' | 'danger'> = {
  principiante: 'success',
  intermedio: 'warning',
  avanzado: 'danger',
};

export function ExerciseLibraryPage() {
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('todos');
  const [selected, setSelected] = useState<Exercise | null>(null);
  const exercises = useQuery({ queryKey: ['exercises'], queryFn: listExercises });

  const groups = useMemo(() => ['todos', ...new Set((exercises.data ?? []).map((e) => e.muscle_group))], [exercises.data]);

  const filtered = useMemo(
    () =>
      (exercises.data ?? []).filter(
        (e) => (group === 'todos' || e.muscle_group === group) && e.name.toLowerCase().includes(search.toLowerCase())
      ),
    [exercises.data, search, group]
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Link to="/app/rutinas" className="inline-flex items-center gap-1.5 text-sm text-base-400 hover:text-base-100">
        <ArrowLeft className="h-4 w-4" /> Volver a rutinas
      </Link>

      <div>
        <h2 className="font-display text-xl font-bold text-base-100">Biblioteca de ejercicios</h2>
        <p className="text-sm text-base-400">Técnica, músculos trabajados y equipo necesario para cada movimiento</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar ejercicio…" className="input-base pl-9" />
        </div>
        <select value={group} onChange={(e) => setGroup(e.target.value)} className="input-base sm:w-56">
          {groups.map((g) => (
            <option key={g} value={g}>
              {g === 'todos' ? 'Todos los grupos musculares' : g}
            </option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {exercises.isLoading
          ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
          : filtered.map((ex) => (
              <button key={ex.id} onClick={() => setSelected(ex)} className="card overflow-hidden text-left hover:border-electric-500/50 transition-colors">
                <img src={ex.image_url} alt={ex.name} className="h-36 w-full object-cover" loading="lazy" />
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-base-100 text-sm">{ex.name}</h3>
                    <Badge tone={difficultyTone[ex.difficulty]} className="shrink-0">
                      {ex.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-base-400">{ex.muscle_group} · {ex.equipment}</p>
                </div>
              </button>
            ))}
      </div>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && (
          <div className="space-y-4">
            <img src={selected.image_url} alt={selected.name} className="h-48 w-full rounded-xl object-cover" />
            <div className="flex flex-wrap gap-2">
              <Badge tone={difficultyTone[selected.difficulty]}>{selected.difficulty}</Badge>
              <Badge tone="electric">{selected.muscle_group}</Badge>
              {selected.secondary_muscles.map((m) => (
                <Badge key={m} tone="neutral">
                  {m}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-base-300">{selected.description}</p>
            <div>
              <p className="text-xs font-medium text-base-400 mb-1.5 flex items-center gap-1.5">
                <Dumbbell className="h-3.5 w-3.5" /> Equipo necesario
              </p>
              <p className="text-sm text-base-200">{selected.equipment}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-base-400 mb-2">Instrucciones</p>
              <ol className="space-y-2">
                {selected.instructions.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-base-200">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-electric-500/15 text-electric-400 text-xs font-semibold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
