import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock, Repeat, Layers, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { assignRoutine, getRoutine, listMembers } from '@/lib/db';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toaster';

export function RoutineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedMember, setSelectedMember] = useState('');
  const queryClient = useQueryClient();
  const { push } = useToast();

  const routine = useQuery({ queryKey: ['routine', id], queryFn: () => getRoutine(id!), enabled: Boolean(id) });
  const members = useQuery({ queryKey: ['members'], queryFn: listMembers });

  const assignMutation = useMutation({
    mutationFn: () => assignRoutine(id!, selectedMember),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine', id] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      push('success', 'Rutina asignada correctamente');
      setSelectedMember('');
    },
  });

  if (routine.isLoading || !routine.data) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const r = routine.data;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/app/rutinas" className="inline-flex items-center gap-1.5 text-sm text-base-400 hover:text-base-100">
        <ArrowLeft className="h-4 w-4" /> Volver a rutinas
      </Link>

      <div className="card p-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="electric" className="capitalize">
            {r.goal.replace('_', ' ')}
          </Badge>
          <Badge tone="neutral" className="capitalize">
            {r.level}
          </Badge>
          <Badge tone="neutral">{r.days_per_week} días/semana</Badge>
        </div>
        <h2 className="font-display text-2xl font-bold text-base-100">{r.name}</h2>
        <p className="text-sm text-base-400">{r.description}</p>
      </div>

      <div className="card p-6 space-y-3">
        <h3 className="font-semibold text-base-100 flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> Asignar a un cliente
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="input-base flex-1">
            <option value="">Selecciona un miembro…</option>
            {members.data
              ?.filter((m) => !r.assigned_member_ids.includes(m.id))
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
          </select>
          <Button disabled={!selectedMember} loading={assignMutation.isPending} onClick={() => assignMutation.mutate()}>
            Asignar rutina
          </Button>
        </div>
        {r.assigned_member_ids.length > 0 && (
          <p className="text-xs text-base-500">{r.assigned_member_ids.length} miembro(s) tienen esta rutina asignada actualmente.</p>
        )}
      </div>

      <div className="space-y-4">
        {r.days.map((day) => (
          <div key={day.day_label} className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-base-100">{day.day_label}</h4>
              <Badge tone="electric">{day.focus}</Badge>
            </div>
            <div className="space-y-3">
              {day.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 rounded-xl border border-base-800 p-3">
                  {item.exercise?.image_url && (
                    <img src={item.exercise.image_url} alt={item.exercise.name} className="h-16 w-16 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="font-medium text-base-100 truncate">{item.exercise?.name}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-base-400">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" /> {item.sets} series
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat className="h-3.5 w-3.5" /> {item.reps}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {item.rest_seconds}s descanso
                      </span>
                    </div>
                    {item.notes && <p className="text-xs text-base-500 italic">{item.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
