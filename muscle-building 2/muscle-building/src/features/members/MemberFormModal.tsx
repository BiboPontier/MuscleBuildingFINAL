import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createMember, listPlans, updateMember } from '@/lib/db';
import type { Member } from '@/types';
import { useToast } from '@/components/ui/Toaster';

const schema = z.object({
  full_name: z.string().min(3, 'Nombre requerido'),
  email: z.string().email('Correo inválido'),
  phone: z.string().min(6, 'Teléfono requerido'),
  plan_id: z.string().min(1, 'Selecciona un plan'),
  status: z.enum(['activo', 'vencido', 'suspendido']),
  weight_kg: z.coerce.number().min(0).optional(),
  height_cm: z.coerce.number().min(0).optional(),
  body_fat_pct: z.coerce.number().min(0).max(100).optional(),
  goal: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function MemberFormModal({ open, onClose, member }: { open: boolean; onClose: () => void; member?: Member | null }) {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const plans = useQuery({ queryKey: ['plans'], queryFn: listPlans });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset(
        member
          ? {
              full_name: member.full_name,
              email: member.email,
              phone: member.phone,
              plan_id: member.plan_id ?? '',
              status: member.status,
              weight_kg: member.weight_kg ?? undefined,
              height_cm: member.height_cm ?? undefined,
              body_fat_pct: member.body_fat_pct ?? undefined,
              goal: member.goal ?? '',
              notes: member.notes ?? '',
            }
          : { status: 'activo' }
      );
    }
  }, [open, member, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const plan = plans.data?.find((p) => p.id === values.plan_id);
      const payload = {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        photo_url: member?.photo_url ?? null,
        status: values.status,
        plan_id: values.plan_id,
        plan_name: plan?.name,
        trainer_id: member?.trainer_id ?? null,
        trainer_name: member?.trainer_name,
        joined_at: member?.joined_at ?? new Date().toISOString().slice(0, 10),
        expires_at: member?.expires_at ?? null,
        weight_kg: values.weight_kg ?? null,
        height_cm: values.height_cm ?? null,
        body_fat_pct: values.body_fat_pct ?? null,
        goal: values.goal || null,
        notes: values.notes || null,
      };
      if (member) return updateMember(member.id, payload);
      return createMember(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      push('success', member ? 'Miembro actualizado' : 'Miembro creado');
      onClose();
    },
    onError: (err) => push('error', err instanceof Error ? err.message : 'Ocurrió un error'),
  });

  return (
    <Modal open={open} onClose={onClose} title={member ? 'Editar miembro' : 'Nuevo miembro'}>
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Nombre completo" error={errors.full_name?.message} {...register('full_name')} />
          <Input label="Correo" type="email" error={errors.email?.message} {...register('email')} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Teléfono" error={errors.phone?.message} {...register('phone')} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-base-200">Plan</label>
            <select className="input-base" {...register('plan_id')}>
              <option value="">Selecciona un plan</option>
              {plans.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ${p.price}
                </option>
              ))}
            </select>
            {errors.plan_id && <p className="text-xs text-danger">{errors.plan_id.message}</p>}
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Peso (kg)" type="number" step="0.1" {...register('weight_kg')} />
          <Input label="Altura (cm)" type="number" {...register('height_cm')} />
          <Input label="% Grasa" type="number" step="0.1" {...register('body_fat_pct')} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Objetivo" placeholder="Ej. Hipertrofia" {...register('goal')} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-base-200">Estado</label>
            <select className="input-base" {...register('status')}>
              <option value="activo">Activo</option>
              <option value="vencido">Vencido</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-base-200">Observaciones</label>
          <textarea className="input-base min-h-20" {...register('notes')} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>
            {member ? 'Guardar cambios' : 'Crear miembro'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
