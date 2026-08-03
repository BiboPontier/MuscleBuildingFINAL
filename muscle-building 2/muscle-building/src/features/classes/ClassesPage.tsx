import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Users } from 'lucide-react';
import { bookClass, listClasses } from '@/lib/db';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toaster';

const dayLabel = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function ClassesPage() {
  const classes = useQuery({ queryKey: ['classes'], queryFn: listClasses });
  const queryClient = useQueryClient();
  const { push } = useToast();

  const bookMutation = useMutation({
    mutationFn: bookClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      push('success', 'Reserva confirmada');
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-base-100">Clases grupales</h2>
        <p className="text-sm text-base-400">Horario semanal, capacidad y reservas</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {classes.isLoading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : classes.data?.map((c) => {
              const full = c.booked >= c.capacity;
              return (
                <div key={c.id} className="card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge tone="electric">{c.category}</Badge>
                    <Badge tone={full ? 'danger' : 'success'}>{full ? 'Lleno' : 'Disponible'}</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base-100">{c.name}</h3>
                    <p className="text-sm text-base-400 flex items-center gap-1.5 mt-1">
                      <CalendarDays className="h-3.5 w-3.5" /> {dayLabel[c.day_of_week]} · {c.start_time} ({c.duration_minutes} min)
                    </p>
                    <p className="text-xs text-base-500 mt-1">Entrenador: {c.trainer_name}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-base-800">
                    <span className="flex items-center gap-1.5 text-sm text-base-300">
                      <Users className="h-4 w-4" /> {c.booked}/{c.capacity}
                    </span>
                    <Button variant={full ? 'secondary' : 'primary'} disabled={full} loading={bookMutation.isPending} onClick={() => bookMutation.mutate(c.id)}>
                      {full ? 'Lista de espera' : 'Reservar cupo'}
                    </Button>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
