import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, UserX, DollarSign, QrCode, Clock } from 'lucide-react';
import { getKpis, listAttendance, listClasses, listPayments } from '@/lib/db';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';

function Kpi({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: string; tone: string }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-base-400">{label}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
      <p className="font-display text-3xl font-bold text-base-100">{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { profile } = useAuth();
  const kpis = useQuery({ queryKey: ['kpis'], queryFn: getKpis });
  const attendance = useQuery({ queryKey: ['attendance'], queryFn: listAttendance });
  const payments = useQuery({ queryKey: ['payments'], queryFn: listPayments });
  const classes = useQuery({ queryKey: ['classes'], queryFn: listClasses });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="font-display text-2xl font-bold text-base-100">Hola, {profile?.full_name?.split(' ')[0]} 👋</h2>
        <p className="text-sm text-base-400 mt-1">Este es el resumen de tu gimnasio hoy.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.isLoading || !kpis.data ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <Kpi icon={Users} label="Total miembros" value={String(kpis.data.total_members)} tone="bg-electric-500/15 text-electric-400" />
            <Kpi icon={UserCheck} label="Activos" value={String(kpis.data.active_members)} tone="bg-success/15 text-success" />
            <Kpi icon={UserX} label="Vencidos" value={String(kpis.data.expired_members)} tone="bg-danger/15 text-danger" />
            <Kpi icon={DollarSign} label="Ingresos del mes" value={formatCurrency(kpis.data.monthly_revenue)} tone="bg-warning/15 text-warning" />
            <Kpi icon={QrCode} label="Asistencia hoy" value={String(kpis.data.today_attendance)} tone="bg-electric-500/15 text-electric-400" />
            <Kpi icon={Clock} label="Pagos pendientes" value={String(kpis.data.upcoming_payments)} tone="bg-warning/15 text-warning" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base-100">Clases de hoy</h3>
          </div>
          <div className="space-y-2">
            {classes.data?.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-base-800 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-base-100">{c.name}</p>
                  <p className="text-xs text-base-400">{c.start_time} · {c.trainer_name}</p>
                </div>
                <Badge tone={c.booked >= c.capacity ? 'danger' : 'electric'}>{c.booked}/{c.capacity} cupos</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-base-100">Actividad reciente</h3>
          <div className="space-y-3">
            {attendance.data?.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-electric-500 shrink-0" />
                <p className="text-sm text-base-300">
                  <span className="text-base-100 font-medium">{a.member_name}</span> registró entrada
                </p>
              </div>
            ))}
            {!attendance.data?.length && <p className="text-sm text-base-500">Sin actividad todavía.</p>}
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-base-100">Próximos pagos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-base-400 border-b border-base-800">
                <th className="py-2 font-medium">Miembro</th>
                <th className="py-2 font-medium">Concepto</th>
                <th className="py-2 font-medium">Vence</th>
                <th className="py-2 font-medium">Monto</th>
                <th className="py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {payments.data
                ?.filter((p) => p.status !== 'pagado')
                .map((p) => (
                  <tr key={p.id} className="border-b border-base-800/60 last:border-0">
                    <td className="py-2.5 text-base-100">{p.member_name}</td>
                    <td className="py-2.5 text-base-300">{p.concept}</td>
                    <td className="py-2.5 text-base-300">{formatDate(p.due_date)}</td>
                    <td className="py-2.5 text-base-100">{formatCurrency(p.amount)}</td>
                    <td className="py-2.5">
                      <Badge tone={p.status === 'vencido' ? 'danger' : 'warning'}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
