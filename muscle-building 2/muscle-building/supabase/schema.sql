-- ============================================================================
-- Muscle Building — Esquema de base de datos para Supabase (PostgreSQL)
-- Incluye: tablas, relaciones, índices, restricciones y políticas RLS.
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Roles y perfiles (extiende auth.users de Supabase)
-- ---------------------------------------------------------------------------
create type user_role as enum ('admin', 'entrenador', 'recepcion', 'cliente');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role user_role not null default 'cliente',
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Crea automáticamente un perfil cuando un usuario se registra en auth.users
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'cliente')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Planes de membresía
-- ---------------------------------------------------------------------------
create table plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  duration_days integer not null check (duration_days > 0),
  benefits text[] not null default '{}',
  discount_pct numeric(5,2) not null default 0 check (discount_pct between 0 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Miembros
-- ---------------------------------------------------------------------------
create type member_status as enum ('activo', 'vencido', 'suspendido');

create table members (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text not null,
  phone text not null,
  photo_url text,
  qr_code text unique default uuid_generate_v4()::text,
  status member_status not null default 'activo',
  plan_id uuid references plans(id) on delete set null,
  trainer_id uuid references profiles(id) on delete set null,
  joined_at date not null default current_date,
  expires_at date,
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  body_fat_pct numeric(4,1),
  goal text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_members_status on members(status);
create index idx_members_trainer on members(trainer_id);
create index idx_members_plan on members(plan_id);

-- ---------------------------------------------------------------------------
-- Asistencia
-- ---------------------------------------------------------------------------
create type attendance_method as enum ('qr', 'membresia', 'manual');

create table attendance (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references members(id) on delete cascade,
  check_in timestamptz not null default now(),
  check_out timestamptz,
  method attendance_method not null default 'qr',
  created_at timestamptz not null default now()
);
create index idx_attendance_member on attendance(member_id);
create index idx_attendance_checkin on attendance(check_in);

-- ---------------------------------------------------------------------------
-- Pagos
-- ---------------------------------------------------------------------------
create type payment_status as enum ('pagado', 'pendiente', 'vencido');
create type payment_method as enum ('efectivo', 'tarjeta', 'transferencia');

create table payments (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references members(id) on delete cascade,
  amount numeric(10,2) not null check (amount >= 0),
  method payment_method not null,
  status payment_status not null default 'pendiente',
  concept text not null,
  paid_at timestamptz,
  due_date date not null,
  created_at timestamptz not null default now()
);
create index idx_payments_member on payments(member_id);
create index idx_payments_status on payments(status);

-- ---------------------------------------------------------------------------
-- Ejercicios y rutinas
-- ---------------------------------------------------------------------------
create type exercise_difficulty as enum ('principiante', 'intermedio', 'avanzado');

create table exercises (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  muscle_group text not null,
  secondary_muscles text[] not null default '{}',
  equipment text not null,
  difficulty exercise_difficulty not null default 'principiante',
  description text not null,
  instructions text[] not null default '{}',
  image_url text,
  video_url text,
  created_at timestamptz not null default now()
);
create index idx_exercises_muscle_group on exercises(muscle_group);

create type routine_goal as enum ('hipertrofia', 'fuerza', 'resistencia', 'perdida_grasa', 'movilidad');
create type routine_level as enum ('principiante', 'intermedio', 'avanzado');

create table routines (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  goal routine_goal not null,
  level routine_level not null,
  days_per_week integer not null check (days_per_week between 1 and 7),
  description text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table routine_days (
  id uuid primary key default uuid_generate_v4(),
  routine_id uuid not null references routines(id) on delete cascade,
  day_label text not null,
  focus text not null,
  sort_order integer not null default 0
);
create index idx_routine_days_routine on routine_days(routine_id);

create table routine_exercises (
  id uuid primary key default uuid_generate_v4(),
  routine_day_id uuid not null references routine_days(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete restrict,
  sets integer not null check (sets > 0),
  reps text not null,
  rest_seconds integer not null default 60,
  notes text,
  sort_order integer not null default 0
);
create index idx_routine_exercises_day on routine_exercises(routine_day_id);

create table member_routines (
  member_id uuid not null references members(id) on delete cascade,
  routine_id uuid not null references routines(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (member_id, routine_id)
);

-- ---------------------------------------------------------------------------
-- Clases grupales
-- ---------------------------------------------------------------------------
create table classes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  trainer_id uuid references profiles(id) on delete set null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  duration_minutes integer not null check (duration_minutes > 0),
  capacity integer not null check (capacity > 0),
  created_at timestamptz not null default now()
);

create table class_bookings (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references classes(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  booked_at timestamptz not null default now(),
  unique (class_id, member_id)
);
create index idx_class_bookings_class on class_bookings(class_id);

-- ---------------------------------------------------------------------------
-- Inventario y ventas
-- ---------------------------------------------------------------------------
create table inventory_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  stock integer not null default 0 check (stock >= 0),
  min_stock integer not null default 5,
  price numeric(10,2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

create table sales (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references inventory_items(id) on delete restrict,
  member_id uuid references members(id) on delete set null,
  quantity integer not null check (quantity > 0),
  total numeric(10,2) not null check (total >= 0),
  sold_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Notificaciones
-- ---------------------------------------------------------------------------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_profile on notifications(profile_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table profiles enable row level security;
alter table plans enable row level security;
alter table members enable row level security;
alter table attendance enable row level security;
alter table payments enable row level security;
alter table exercises enable row level security;
alter table routines enable row level security;
alter table routine_days enable row level security;
alter table routine_exercises enable row level security;
alter table member_routines enable row level security;
alter table classes enable row level security;
alter table class_bookings enable row level security;
alter table inventory_items enable row level security;
alter table sales enable row level security;
alter table notifications enable row level security;

-- Helper: rol del usuario autenticado actual
create function public.current_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

-- Perfiles: cada usuario ve y edita el suyo; el staff ve todos
create policy "profiles_select_own_or_staff" on profiles for select
  using (auth.uid() = id or public.current_role() in ('admin', 'entrenador', 'recepcion'));
create policy "profiles_update_own" on profiles for update
  using (auth.uid() = id);

-- Planes y ejercicios: lectura pública para usuarios autenticados, escritura solo admin
create policy "plans_select_authenticated" on plans for select using (auth.role() = 'authenticated');
create policy "plans_write_admin" on plans for all using (public.current_role() = 'admin');

create policy "exercises_select_authenticated" on exercises for select using (auth.role() = 'authenticated');
create policy "exercises_write_staff" on exercises for all using (public.current_role() in ('admin', 'entrenador'));

-- Miembros: staff con acceso completo; el cliente solo ve su propio registro
create policy "members_select_staff_or_self" on members for select
  using (public.current_role() in ('admin', 'entrenador', 'recepcion') or email = (select email from profiles where id = auth.uid()));
create policy "members_write_staff" on members for insert with check (public.current_role() in ('admin', 'recepcion'));
create policy "members_update_staff" on members for update using (public.current_role() in ('admin', 'recepcion', 'entrenador'));
create policy "members_delete_admin" on members for delete using (public.current_role() = 'admin');

-- Asistencia, pagos, rutinas, clases: gestión por staff
create policy "attendance_select_staff" on attendance for select using (public.current_role() in ('admin', 'entrenador', 'recepcion'));
create policy "attendance_write_staff" on attendance for insert with check (public.current_role() in ('admin', 'recepcion', 'entrenador'));

create policy "payments_select_staff" on payments for select using (public.current_role() in ('admin', 'recepcion'));
create policy "payments_write_staff" on payments for all using (public.current_role() in ('admin', 'recepcion'));

create policy "routines_select_authenticated" on routines for select using (auth.role() = 'authenticated');
create policy "routines_write_staff" on routines for all using (public.current_role() in ('admin', 'entrenador'));
create policy "routine_days_select_authenticated" on routine_days for select using (auth.role() = 'authenticated');
create policy "routine_days_write_staff" on routine_days for all using (public.current_role() in ('admin', 'entrenador'));
create policy "routine_exercises_select_authenticated" on routine_exercises for select using (auth.role() = 'authenticated');
create policy "routine_exercises_write_staff" on routine_exercises for all using (public.current_role() in ('admin', 'entrenador'));
create policy "member_routines_select_authenticated" on member_routines for select using (auth.role() = 'authenticated');
create policy "member_routines_write_staff" on member_routines for all using (public.current_role() in ('admin', 'entrenador'));

create policy "classes_select_authenticated" on classes for select using (auth.role() = 'authenticated');
create policy "classes_write_staff" on classes for all using (public.current_role() in ('admin', 'entrenador'));
create policy "class_bookings_select_authenticated" on class_bookings for select using (auth.role() = 'authenticated');
create policy "class_bookings_write_authenticated" on class_bookings for insert with check (auth.role() = 'authenticated');

create policy "inventory_select_staff" on inventory_items for select using (public.current_role() in ('admin', 'recepcion'));
create policy "inventory_write_admin" on inventory_items for all using (public.current_role() = 'admin');
create policy "sales_select_staff" on sales for select using (public.current_role() in ('admin', 'recepcion'));
create policy "sales_write_staff" on sales for all using (public.current_role() in ('admin', 'recepcion'));

create policy "notifications_select_own" on notifications for select using (profile_id = auth.uid());
create policy "notifications_update_own" on notifications for update using (profile_id = auth.uid());
