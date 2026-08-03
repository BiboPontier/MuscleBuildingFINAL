import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Receipt } from 'lucide-react';
import { createPayment, listMembers, listPayments } from '@/lib/db';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toaster';
import type { PaymentStatus } from '@/types';

const statusTone: Record<PaymentStatus, 'success' | 'warning' | 'danger'> = { pagado: 'success', pendiente: 'warning', vencido: 'danger' };

const schema = z.object({
  member_id: z.string().min(1, 'Selecciona un miembro'),
  concept: z.string().min(2, 'Ingresa un concepto'),
  amount: z.coerce.number().min(1, 'Monto inválido'),
  method: z.enum(['efectivo', 'tarjeta', 'transferencia']),
  status: z.enum(['pagado', 'pendiente', 'vencido']),
  due_date: z.string().min(1, 'Fecha requerida'),
});
type FormValues = z.infer<typeof schema>;

export function PaymentsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { push } = useToast();

  const payments = useQuery({ queryKey: ['payments'], queryFn: listPayments });
  const members = useQuery({ queryKey: ['members'], queryFn: listMembers });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { method: 'efectivo', status: 'pagado' } });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const member = members.data?.find((m) => m.id === values.member_id);
      return createPayment({
        member_id: values.member_id,
        member_name: member?.full_name,
        amount: values.amount,
        method: values.method,
        status: values.status,
        paid_at: values.status === 'pagado' ? new Date().toISOString() : null,
        due_date: values.due_date,
        concept: values.concept,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      push('success', 'Pago registrado');
      reset();
      setModalOpen(false);
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-base-100">Pagos</h2>
          <p className="text-sm text-base-400">Historial y registro de pagos de membresías</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Registrar pago
        </Button>
      </div>

      <div className="card p-2">
        {payments.isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={5} />
          </div>
        ) : !payments.data?.length ? (
          <EmptyState icon={Receipt} title="Sin pagos registrados" description="Registra el primer pago para comenzar el historial." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-base-400 border-b border-base-800">
                  <th className="py-3 px-3 font-medium">Miembro</th>
                  <th className="py-3 px-3 font-medium">Concepto</th>
                  <th className="py-3 px-3 font-medium">Método</th>
                  <th className="py-3 px-3 font-medium">Vencimiento</th>
                  <th className="py-3 px-3 font-medium">Monto</th>
                  <th className="py-3 px-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {payments.data.map((p) => (
                  <tr key={p.id} className="border-b border-base-800/60 last:border-0">
                    <td className="py-3 px-3 text-base-100">{p.member_name}</td>
                    <td className="py-3 px-3 text-base-300">{p.concept}</td>
                    <td className="py-3 px-3 text-base-300 capitalize">{p.method}</td>
                    <td className="py-3 px-3 text-base-300">{formatDate(p.due_date)}</td>
                    <td className="py-3 px-3 text-base-100">{formatCurrency(p.amount)}</td>
                    <td className="py-3 px-3">
                      <Badge tone={statusTone[p.status]}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar pago">
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-base-200">Miembro</label>
            <select className="input-base" {...register('member_id')}>
              <option value="">Selecciona un miembro</option>
              {members.data?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>
            {errors.member_id && <p className="text-xs text-danger">{errors.member_id.message}</p>}
          </div>
          <Input label="Concepto" placeholder="Ej. Renovación mensual" error={errors.concept?.message} {...register('concept')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Monto (US$)" type="number" step="0.01" error={errors.amount?.message} {...register('amount')} />
            <Input label="Fecha de vencimiento" type="date" error={errors.due_date?.message} {...register('due_date')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-base-200">Método de pago</label>
              <select className="input-base" {...register('method')}>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-base-200">Estado</label>
              <select className="input-base" {...register('status')}>
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting || mutation.isPending}>
              Registrar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
