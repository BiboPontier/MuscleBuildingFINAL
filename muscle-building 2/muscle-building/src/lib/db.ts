/**
 * Capa de acceso a datos de Muscle Building.
 *
 * Por defecto la app corre en "modo demo": persiste todo en localStorage
 * con la MISMA forma de datos que tendría Supabase (ver supabase/schema.sql),
 * así que funciona de inmediato con `npm install && npm run dev`, sin backend.
 *
 * Cuando el usuario configure VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env,
 * basta con reemplazar el cuerpo de cada función por la consulta equivalente de
 * `supabase.from(...)` (ya importado arriba) — las firmas y tipos no cambian.
 */
import { supabase } from './supabase';
import type {
  AttendanceRecord,
  Exercise,
  GymClass,
  KpiSummary,
  Member,
  Payment,
  Plan,
  Profile,
  Routine,
  UserRole,
} from '@/types';
import { EXERCISES_SEED } from '@/data/exercises';
import { ROUTINES_SEED } from '@/data/routines';

export const IS_SUPABASE_CONFIGURED = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

const DELAY = 260;
const wait = (ms = DELAY) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Almacén local (localStorage) — simula las tablas de Supabase
// ---------------------------------------------------------------------------
interface DemoUser {
  id: string;
  email: string;
  password: string;
  profile: Profile;
}

interface DemoDB {
  users: DemoUser[];
  sessionUserId: string | null;
  members: Member[];
  plans: Plan[];
  payments: Payment[];
  exercises: Exercise[];
  routines: Routine[];
  classes: GymClass[];
  attendance: AttendanceRecord[];
}

const STORAGE_KEY = 'muscle-building-demo-db-v1';

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function seed(): DemoDB {
  const adminId = uid('usr');
  const trainerId = uid('usr');
  const plans: Plan[] = [
    { id: uid('plan'), name: 'Mensual', price: 29, duration_days: 30, benefits: ['Acceso full gym', 'Casillero'], discount_pct: 0, active: true },
    { id: uid('plan'), name: 'Trimestral', price: 79, duration_days: 90, benefits: ['Acceso full gym', 'Casillero', '2 clases grupales/semana'], discount_pct: 10, active: true },
    { id: uid('plan'), name: 'Anual', price: 279, duration_days: 365, benefits: ['Acceso full gym', 'Casillero', 'Clases ilimitadas', 'Evaluación mensual'], discount_pct: 20, active: true },
  ];

  const members: Member[] = [
    { id: uid('mem'), full_name: 'Carla Méndez', email: 'carla@example.com', phone: '809-555-0142', photo_url: null, status: 'activo', plan_id: plans[1].id, plan_name: plans[1].name, trainer_id: trainerId, trainer_name: 'Luis Fernández', joined_at: '2026-02-10', expires_at: '2026-08-10', weight_kg: 61, height_cm: 165, body_fat_pct: 24, goal: 'Pérdida de grasa', notes: 'Prefiere entrenar en la mañana.' },
    { id: uid('mem'), full_name: 'Miguel Ángel Torres', email: 'miguel@example.com', phone: '809-555-0198', photo_url: null, status: 'activo', plan_id: plans[2].id, plan_name: plans[2].name, trainer_id: trainerId, trainer_name: 'Luis Fernández', joined_at: '2025-11-02', expires_at: '2026-11-02', weight_kg: 82, height_cm: 178, body_fat_pct: 18, goal: 'Hipertrofia', notes: '' },
    { id: uid('mem'), full_name: 'Ana Lucía Reyes', email: 'ana@example.com', phone: '809-555-0111', photo_url: null, status: 'vencido', plan_id: plans[0].id, plan_name: plans[0].name, trainer_id: null, trainer_name: undefined, joined_at: '2026-04-01', expires_at: '2026-07-01', weight_kg: 58, height_cm: 160, body_fat_pct: 27, goal: 'Tonificación', notes: 'Renovar plan pendiente.' },
    { id: uid('mem'), full_name: 'José Ramón Peña', email: 'jose@example.com', phone: '809-555-0177', photo_url: null, status: 'activo', plan_id: plans[0].id, plan_name: plans[0].name, trainer_id: null, trainer_name: undefined, joined_at: '2026-06-20', expires_at: '2026-08-20', weight_kg: 90, height_cm: 182, body_fat_pct: 22, goal: 'Fuerza', notes: '' },
  ];

  const payments: Payment[] = [
    { id: uid('pay'), member_id: members[0].id, member_name: members[0].full_name, amount: 79 * 0.9, method: 'tarjeta', status: 'pagado', paid_at: '2026-05-10', due_date: '2026-05-10', concept: 'Plan Trimestral' },
    { id: uid('pay'), member_id: members[1].id, member_name: members[1].full_name, amount: 279 * 0.8, method: 'transferencia', status: 'pagado', paid_at: '2025-11-02', due_date: '2025-11-02', concept: 'Plan Anual' },
    { id: uid('pay'), member_id: members[2].id, member_name: members[2].full_name, amount: 29, method: 'efectivo', status: 'vencido', paid_at: null, due_date: '2026-07-01', concept: 'Renovación Mensual' },
    { id: uid('pay'), member_id: members[3].id, member_name: members[3].full_name, amount: 29, method: 'tarjeta', status: 'pendiente', paid_at: null, due_date: '2026-08-20', concept: 'Plan Mensual' },
  ];

  const classes: GymClass[] = [
    { id: uid('cls'), name: 'CrossFit Intenso', category: 'CrossFit', trainer_id: trainerId, trainer_name: 'Luis Fernández', day_of_week: 1, start_time: '06:30', duration_minutes: 50, capacity: 16, booked: 11 },
    { id: uid('cls'), name: 'Yoga Restaurativo', category: 'Yoga', trainer_id: trainerId, trainer_name: 'Luis Fernández', day_of_week: 2, start_time: '18:00', duration_minutes: 60, capacity: 20, booked: 14 },
    { id: uid('cls'), name: 'Spinning Power', category: 'Spinning', trainer_id: trainerId, trainer_name: 'Luis Fernández', day_of_week: 3, start_time: '07:00', duration_minutes: 45, capacity: 18, booked: 18 },
    { id: uid('cls'), name: 'HIIT Quema Total', category: 'HIIT', trainer_id: trainerId, trainer_name: 'Luis Fernández', day_of_week: 4, start_time: '19:00', duration_minutes: 40, capacity: 14, booked: 9 },
  ];

  const attendance: AttendanceRecord[] = [
    { id: uid('att'), member_id: members[0].id, member_name: members[0].full_name, check_in: new Date().toISOString(), check_out: null, method: 'qr' },
    { id: uid('att'), member_id: members[1].id, member_name: members[1].full_name, check_in: new Date(Date.now() - 3600_000).toISOString(), check_out: new Date(Date.now() - 900_000).toISOString(), method: 'membresia' },
  ];

  const users: DemoUser[] = [
    {
      id: adminId,
      email: 'admin@musclebuilding.app',
      password: 'admin123',
      profile: { id: adminId, email: 'admin@musclebuilding.app', full_name: 'Administrador Demo', role: 'admin', avatar_url: null, phone: null, created_at: new Date().toISOString() },
    },
    {
      id: trainerId,
      email: 'entrenador@musclebuilding.app',
      password: 'entrenador123',
      profile: { id: trainerId, email: 'entrenador@musclebuilding.app', full_name: 'Luis Fernández', role: 'entrenador', avatar_url: null, phone: null, created_at: new Date().toISOString() },
    },
  ];

  return {
    users,
    sessionUserId: null,
    members,
    plans,
    payments,
    exercises: EXERCISES_SEED,
    routines: ROUTINES_SEED,
    classes,
    attendance,
  };
}

function load(): DemoDB {
  if (typeof window === 'undefined') return seed();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const fresh = seed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return JSON.parse(raw) as DemoDB;
  } catch {
    const fresh = seed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

function save(db: DemoDB) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function mutate<T>(fn: (db: DemoDB) => T): T {
  const db = load();
  const result = fn(db);
  save(db);
  return result;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function registerUser(input: { full_name: string; email: string; password: string; role: UserRole }) {
  await wait();
  if (IS_SUPABASE_CONFIGURED) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { full_name: input.full_name, role: input.role } },
    });
    if (error) throw new Error(error.message);
    return data;
  }
  return mutate((db) => {
    if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error('Ya existe una cuenta con ese correo.');
    }
    const id = uid('usr');
    const profile: Profile = { id, email: input.email, full_name: input.full_name, role: input.role, avatar_url: null, phone: null, created_at: new Date().toISOString() };
    db.users.push({ id, email: input.email, password: input.password, profile });
    db.sessionUserId = id;
    return profile;
  });
}

export async function loginUser(email: string, password: string) {
  await wait();
  if (IS_SUPABASE_CONFIGURED) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  }
  return mutate((db) => {
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) throw new Error('Correo o contraseña incorrectos.');
    db.sessionUserId = user.id;
    return user.profile;
  });
}

export async function logoutUser() {
  await wait(120);
  if (IS_SUPABASE_CONFIGURED) {
    await supabase.auth.signOut();
    return;
  }
  mutate((db) => {
    db.sessionUserId = null;
  });
}

export async function requestPasswordReset(email: string) {
  await wait();
  if (IS_SUPABASE_CONFIGURED) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
    return;
  }
  return mutate((db) => {
    const exists = db.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) throw new Error('No encontramos una cuenta con ese correo.');
  });
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (IS_SUPABASE_CONFIGURED) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const meta = data.user.user_metadata as { full_name?: string; role?: UserRole };
    return {
      id: data.user.id,
      email: data.user.email ?? '',
      full_name: meta.full_name ?? data.user.email ?? 'Usuario',
      role: meta.role ?? 'cliente',
      avatar_url: null,
      phone: null,
      created_at: data.user.created_at,
    };
  }
  const db = load();
  const user = db.users.find((u) => u.id === db.sessionUserId);
  return user?.profile ?? null;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export async function getKpis(): Promise<KpiSummary> {
  await wait();
  const db = load();
  const today = new Date().toDateString();
  return {
    total_members: db.members.length,
    active_members: db.members.filter((m) => m.status === 'activo').length,
    expired_members: db.members.filter((m) => m.status === 'vencido').length,
    monthly_revenue: db.payments.filter((p) => p.status === 'pagado').reduce((sum, p) => sum + p.amount, 0),
    today_attendance: db.attendance.filter((a) => new Date(a.check_in).toDateString() === today).length,
    upcoming_payments: db.payments.filter((p) => p.status === 'pendiente').length,
  };
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------
export async function listMembers(): Promise<Member[]> {
  await wait();
  return load().members;
}

export async function createMember(input: Omit<Member, 'id'>): Promise<Member> {
  await wait();
  return mutate((db) => {
    const member: Member = { ...input, id: uid('mem') };
    db.members.unshift(member);
    return member;
  });
}

export async function updateMember(id: string, patch: Partial<Member>): Promise<Member> {
  await wait();
  return mutate((db) => {
    const idx = db.members.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('Miembro no encontrado');
    db.members[idx] = { ...db.members[idx], ...patch };
    return db.members[idx];
  });
}

export async function deleteMember(id: string): Promise<void> {
  await wait();
  mutate((db) => {
    db.members = db.members.filter((m) => m.id !== id);
  });
}

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------
export async function listPlans(): Promise<Plan[]> {
  await wait(150);
  return load().plans;
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------
export async function listPayments(): Promise<Payment[]> {
  await wait();
  return load().payments;
}

export async function createPayment(input: Omit<Payment, 'id'>): Promise<Payment> {
  await wait();
  return mutate((db) => {
    const payment: Payment = { ...input, id: uid('pay') };
    db.payments.unshift(payment);
    return payment;
  });
}

// ---------------------------------------------------------------------------
// Exercises & Routines
// ---------------------------------------------------------------------------
export async function listExercises(): Promise<Exercise[]> {
  await wait();
  return load().exercises;
}

export async function listRoutines(): Promise<Routine[]> {
  await wait();
  const db = load();
  return db.routines.map((r) => ({
    ...r,
    days: r.days.map((d) => ({
      ...d,
      items: d.items.map((it) => ({ ...it, exercise: db.exercises.find((e) => e.id === it.exercise_id) })),
    })),
  }));
}

export async function getRoutine(id: string): Promise<Routine | null> {
  const routines = await listRoutines();
  return routines.find((r) => r.id === id) ?? null;
}

export async function assignRoutine(routineId: string, memberId: string): Promise<void> {
  await wait();
  mutate((db) => {
    const routine = db.routines.find((r) => r.id === routineId);
    if (routine && !routine.assigned_member_ids.includes(memberId)) {
      routine.assigned_member_ids.push(memberId);
    }
  });
}

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------
export async function listClasses(): Promise<GymClass[]> {
  await wait();
  return load().classes;
}

export async function bookClass(classId: string): Promise<void> {
  await wait();
  mutate((db) => {
    const cls = db.classes.find((c) => c.id === classId);
    if (cls && cls.booked < cls.capacity) cls.booked += 1;
  });
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------
export async function listAttendance(): Promise<AttendanceRecord[]> {
  await wait();
  return load().attendance;
}

export async function registerCheckIn(memberId: string, method: AttendanceRecord['method']): Promise<AttendanceRecord> {
  await wait();
  return mutate((db) => {
    const member = db.members.find((m) => m.id === memberId);
    const record: AttendanceRecord = {
      id: uid('att'),
      member_id: memberId,
      member_name: member?.full_name ?? 'Miembro',
      check_in: new Date().toISOString(),
      check_out: null,
      method,
    };
    db.attendance.unshift(record);
    return record;
  });
}
