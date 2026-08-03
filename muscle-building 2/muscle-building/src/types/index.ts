export type UserRole = 'admin' | 'entrenador' | 'recepcion' | 'cliente';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

export type MemberStatus = 'activo' | 'vencido' | 'suspendido';

export interface Member {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  photo_url: string | null;
  status: MemberStatus;
  plan_id: string | null;
  plan_name?: string;
  trainer_id: string | null;
  trainer_name?: string;
  joined_at: string;
  expires_at: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  body_fat_pct: number | null;
  goal: string | null;
  notes: string | null;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  benefits: string[];
  discount_pct: number;
  active: boolean;
}

export type PaymentStatus = 'pagado' | 'pendiente' | 'vencido';
export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';

export interface Payment {
  id: string;
  member_id: string;
  member_name?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paid_at: string | null;
  due_date: string;
  concept: string;
}

export type ExerciseDifficulty = 'principiante' | 'intermedio' | 'avanzado';

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  secondary_muscles: string[];
  equipment: string;
  difficulty: ExerciseDifficulty;
  description: string;
  instructions: string[];
  image_url: string;
  video_url: string | null;
}

export interface RoutineExerciseItem {
  exercise_id: string;
  exercise?: Exercise;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
}

export interface RoutineDay {
  day_label: string;
  focus: string;
  items: RoutineExerciseItem[];
}

export type RoutineLevel = 'principiante' | 'intermedio' | 'avanzado';
export type RoutineGoal = 'hipertrofia' | 'fuerza' | 'resistencia' | 'perdida_grasa' | 'movilidad';

export interface Routine {
  id: string;
  name: string;
  goal: RoutineGoal;
  level: RoutineLevel;
  days_per_week: number;
  description: string;
  days: RoutineDay[];
  assigned_member_ids: string[];
}

export interface GymClass {
  id: string;
  name: string;
  category: string;
  trainer_id: string;
  trainer_name?: string;
  day_of_week: number;
  start_time: string;
  duration_minutes: number;
  capacity: number;
  booked: number;
}

export interface AttendanceRecord {
  id: string;
  member_id: string;
  member_name?: string;
  check_in: string;
  check_out: string | null;
  method: 'qr' | 'membresia' | 'manual';
}

export interface KpiSummary {
  total_members: number;
  active_members: number;
  expired_members: number;
  monthly_revenue: number;
  today_attendance: number;
  upcoming_payments: number;
}
