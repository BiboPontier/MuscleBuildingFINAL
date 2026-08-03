import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from './AuthShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toaster';

const schema = z
  .object({
    full_name: z.string().min(3, 'Ingresa tu nombre completo'),
    email: z.string().email('Ingresa un correo válido'),
    role: z.enum(['cliente', 'entrenador', 'recepcion', 'admin']),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: 'Las contraseñas no coinciden', path: ['confirm'] });
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: 'cliente' } });

  async function onSubmit(values: FormValues) {
    try {
      await registerUser({ full_name: values.full_name, email: values.email, password: values.password, role: values.role });
      push('success', 'Cuenta creada correctamente');
      navigate('/app');
    } catch (err) {
      push('error', err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    }
  }

  return (
    <AuthShell title="Crea tu cuenta" subtitle="Empieza a usar Muscle Building en minutos">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nombre completo" placeholder="Ej. María Pérez" error={errors.full_name?.message} {...register('full_name')} />
        <Input label="Correo electrónico" type="email" placeholder="tucorreo@gimnasio.com" error={errors.email?.message} {...register('email')} />
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-base-200">Tipo de cuenta</label>
          <select className="input-base" {...register('role')}>
            <option value="cliente">Cliente</option>
            <option value="entrenador">Entrenador</option>
            <option value="recepcion">Recepción</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <Input label="Contraseña" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        <Input label="Confirmar contraseña" type="password" placeholder="••••••••" error={errors.confirm?.message} {...register('confirm')} />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Crear cuenta
        </Button>
      </form>
      <p className="text-center text-sm text-base-400">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-electric-400 hover:text-electric-300 font-medium">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
