import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AuthShell } from './AuthShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { requestPasswordReset } from '@/lib/db';
import { useToast } from '@/components/ui/Toaster';

const schema = z.object({ email: z.string().email('Ingresa un correo válido') });
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { push } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await requestPasswordReset(values.email);
      setSent(true);
    } catch (err) {
      push('error', err instanceof Error ? err.message : 'No se pudo procesar la solicitud');
    }
  }

  return (
    <AuthShell title="Recupera tu contraseña" subtitle="Te enviaremos instrucciones a tu correo">
      {sent ? (
        <div className="card p-5 space-y-2 text-center animate-fade-in">
          <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
          <p className="text-sm text-base-200">Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Correo electrónico" type="email" placeholder="tucorreo@gimnasio.com" error={errors.email?.message} {...register('email')} />
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Enviar instrucciones
          </Button>
        </form>
      )}
      <p className="text-center text-sm text-base-400">
        <Link to="/login" className="text-electric-400 hover:text-electric-300 font-medium">
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthShell>
  );
}
