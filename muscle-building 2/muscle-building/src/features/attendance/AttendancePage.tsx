import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QrCode, IdCard, Keyboard, Clock } from 'lucide-react';
import { listAttendance, listMembers, registerCheckIn } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toaster';
import { cn } from '@/lib/utils';
import type { AttendanceRecord } from '@/types';

const methodLabel: Record<AttendanceRecord['method'], string> = { qr: 'Código QR', membresia: 'N.º de membresía', manual: 'Nombre' };
const methodIcon = { qr: QrCode, membresia: IdCard, manual: Keyboard } as const;

export function AttendancePage() {
  const [method, setMethod] = useState<AttendanceRecord['method']>('qr');
  const [selectedMember, setSelectedMember] = useState('');
  const queryClient = useQueryClient();
  const { push } = useToast();

  const members = useQuery({ queryKey: ['members'], queryFn: listMembers });
  const attendance = useQuery({ queryKey: ['attendance'], queryFn: listAttendance });

  const checkInMutation = useMutation({
    mutationFn: () => registerCheckIn(selectedMember, method),
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      push('success', `Entrada registrada para ${record.member_name}`);
      setSelectedMember('');
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-base-100">Registrar entrada</h2>
        <div className="grid grid-cols-3 gap-2">
          {(['qr', 'membresia', 'manual'] as const).map((m) => {
            const Icon = methodIcon[m];
            return (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-xs font-medium transition-colors',
                  method === m ? 'border-electric-500 bg-electric-500/10 text-electric-300' : 'border-base-700 text-base-400 hover:bg-base-800'
                )}
              >
                <Icon className="h-5 w-5" />
                {methodLabel[m]}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="input-base flex-1">
            <option value="">Selecciona un miembro…</option>
            {members.data?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name} — {m.email}
              </option>
            ))}
          </select>
          <Button disabled={!selectedMember} loading={checkInMutation.isPending} onClick={() => checkInMutation.mutate()}>
            Registrar entrada
          </Button>
        </div>
        <p className="text-xs text-base-500">
          En producción, este panel se conecta a un lector de código QR o a la búsqueda por número de membresía en tiempo real.
        </p>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-base-100">Últimos accesos</h3>
        {attendance.isLoading ? (
          <TableSkeleton rows={4} />
        ) : !attendance.data?.length ? (
          <EmptyState icon={Clock} title="Sin registros de asistencia" description="Los check-ins que registres aparecerán aquí." />
        ) : (
          <div className="space-y-2">
            {attendance.data.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-base-800 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-base-100">{a.member_name}</p>
                  <p className="text-xs text-base-400">Entrada: {new Date(a.check_in).toLocaleString('es-DO')}</p>
                </div>
                <span className="badge bg-base-800 text-base-300">{methodLabel[a.method]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
