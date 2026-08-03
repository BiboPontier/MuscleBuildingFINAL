import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from './AuthShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import { IS_SUPABASE_CONFIGURED } from '@/lib/db';

const schema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await login(values.email, values.password);
      push('success', '¡Bienvenido de nuevo!');
      navigate('/app');
    } catch (err) {
      push('error', err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    }
  }

  function fillDemo(role: 'admin' | 'entrenador') {
    const creds = role === 'admin' ? { email: 'admin@musclebuilding.app', password: 'admin123' } : { email: 'entrenador@musclebuilding.app', password: 'entrenador123' };
    setValue('email', creds.email);
    setValue('password', creds.password);
  }

  return (
    <AuthShell title="Inicia sesión" subtitle="Accede a tu panel de Muscle Building">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Correo electrónico" type="email" placeholder="tucorreo@gimnasio.com" error={errors.email?.message} {...register('email')} />
        <Input label="Contraseña" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        <div className="flex justify-end">
          <Link to="/recuperar-contrasena" className="text-sm text-electric-400 hover:text-electric-300">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Iniciar sesión
        </Button>
      </form>

      {!IS_SUPABASE_CONFIGURED && (
        <div className="rounded-xl border border-base-700 bg-base-900/60 p-3.5 space-y-2">
          <p className="text-xs text-base-400">
            Modo demo activo (sin Supabase configurado). Prueba con una cuenta de ejemplo:
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => fillDemo('admin')} className="btn-secondary flex-1 !py-2 !text-xs">
              Usar admin demo
            </button>
            <button type="button" onClick={() => fillDemo('entrenador')} className="btn-secondary flex-1 !py-2 !text-xs">
              Usar entrenador demo
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-sm text-base-400">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="text-electric-400 hover:text-electric-300 font-medium">
          Regístrate
        </Link>
      </p>
    </AuthShell>
  );
}
