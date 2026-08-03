import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toaster';

interface SettingsForm {
  gym_name: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
}

export function SettingsPage() {
  const { push } = useToast();
  const { register, handleSubmit } = useForm<SettingsForm>({
    defaultValues: {
      gym_name: 'Muscle Building',
      address: '',
      phone: '',
      email: '',
      currency: 'USD',
      timezone: 'America/Santo_Domingo',
    },
  });

  function onSubmit() {
    push('success', 'Configuración guardada');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-base-100">Configuración</h2>
        <p className="text-sm text-base-400">Perfil del gimnasio y preferencias generales</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <Input label="Nombre del gimnasio" {...register('gym_name')} />
        <Input label="Dirección" {...register('address')} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Teléfono" {...register('phone')} />
          <Input label="Correo de contacto" type="email" {...register('email')} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-base-200">Moneda</label>
            <select className="input-base" {...register('currency')}>
              <option value="USD">USD — Dólar</option>
              <option value="DOP">DOP — Peso dominicano</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-base-200">Zona horaria</label>
            <select className="input-base" {...register('timezone')}>
              <option value="America/Santo_Domingo">América/Santo Domingo</option>
              <option value="America/Mexico_City">América/Ciudad de México</option>
              <option value="America/Bogota">América/Bogotá</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit">Guardar cambios</Button>
        </div>
      </form>
    </div>
  );
}
