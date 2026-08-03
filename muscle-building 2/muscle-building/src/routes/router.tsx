import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { MembersPage } from '@/features/members/MembersPage';
import { AttendancePage } from '@/features/attendance/AttendancePage';
import { RoutinesPage } from '@/features/routines/RoutinesPage';
import { RoutineDetailPage } from '@/features/routines/RoutineDetailPage';
import { ExerciseLibraryPage } from '@/features/routines/ExerciseLibraryPage';
import { ClassesPage } from '@/features/classes/ClassesPage';
import { PaymentsPage } from '@/features/payments/PaymentsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/registro', element: <RegisterPage /> },
  { path: '/recuperar-contrasena', element: <ForgotPasswordPage /> },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'miembros', element: <MembersPage /> },
      { path: 'asistencia', element: <AttendancePage /> },
      { path: 'rutinas', element: <RoutinesPage /> },
      { path: 'rutinas/ejercicios', element: <ExerciseLibraryPage /> },
      { path: 'rutinas/:id', element: <RoutineDetailPage /> },
      { path: 'clases', element: <ClassesPage /> },
      { path: 'pagos', element: <PaymentsPage /> },
      { path: 'configuracion', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
