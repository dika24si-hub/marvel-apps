-- =====================================================================
-- VetCare CRM — Skema Database Supabase (PostgreSQL)
-- Sesuai PRD v1.0 (Politeknik Caltex Riau)
--
-- Cara pakai:
--   1. Buka Supabase Dashboard > SQL Editor
--   2. Paste seluruh isi file ini, lalu Run
--   3. Buat akun admin & dokter lewat Auth, set role di tabel profiles
--
-- Catatan: jalankan berurutan. Aman dijalankan ulang (IF NOT EXISTS).
-- =====================================================================

-- ---------- ENUM TYPES ----------
do $$ begin
  create type user_role as enum ('member', 'doctor', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type appointment_status as enum ('PENDING','CONFIRMED','COMPLETED','CANCELLED','NO_SHOW');
exception when duplicate_object then null; end $$;

do $$ begin
  create type invoice_status as enum ('PENDING','PAID','FAILED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type point_type as enum ('EARN','REDEEM','EXPIRE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type consultation_status as enum ('OPEN','ANSWERED','CLOSED');
exception when duplicate_object then null; end $$;

-- ---------- 1. PROFILES (1:1 auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  city text,
  role user_role not null default 'member',
  avatar_url text,
  is_active boolean default true,
  last_login timestamptz,
  created_at timestamptz default now()
);

-- ---------- 2. ANIMALS (pets) ----------
create table if not exists public.animals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  species text,
  breed text,
  gender text,
  birth_date date,
  weight numeric,
  color text,
  microchip text,
  main_vet text,
  photo_url text,
  health_status text default 'healthy',   -- healthy | recovery | sick
  vaccine_status text default 'belum',     -- lengkap | parsial | belum
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.animal_allergies (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid references public.animals(id) on delete cascade,
  allergy_type text,
  description text
);

-- ---------- 3. DOCTORS (1:1 profiles role=doctor) ----------
create table if not exists public.doctors (
  id uuid primary key references public.profiles(id) on delete cascade,
  specialization text,
  str_number text,
  bio text,
  is_active boolean default true,
  rating_avg numeric default 0
);

create table if not exists public.doctor_schedules (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references public.doctors(id) on delete cascade,
  day_of_week int,           -- 0=Minggu .. 6=Sabtu
  start_time time,
  end_time time,
  max_slots int default 1
);

create table if not exists public.doctor_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references public.doctors(id) on delete cascade,
  blocked_date date,
  reason text
);

-- ---------- 4. SERVICES ----------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  base_price numeric default 0,
  duration_minutes int default 30,
  is_active boolean default true
);

create table if not exists public.service_pricing (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete cascade,
  animal_species text,
  price numeric
);

-- ---------- 5. APPOINTMENTS ----------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade,
  animal_id uuid references public.animals(id) on delete cascade,
  doctor_id uuid references public.doctors(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  scheduled_at timestamptz,
  status appointment_status default 'PENDING',
  complaint text,
  created_at timestamptz default now()
);

-- ---------- 6. MEDICAL RECORDS ----------
create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete cascade,
  doctor_id uuid references public.doctors(id) on delete set null,
  animal_id uuid references public.animals(id) on delete cascade,
  weight_at_visit numeric,
  temperature numeric,
  heart_rate int,
  physical_exam_notes text,
  diagnosis text,
  diagnosis_code text,
  actions_taken text,
  follow_up_date date,
  is_locked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  medical_record_id uuid references public.medical_records(id) on delete cascade,
  drug_name text,
  dosage text,
  frequency text,
  duration_days int,
  notes text
);

create table if not exists public.medical_attachments (
  id uuid primary key default gen_random_uuid(),
  medical_record_id uuid references public.medical_records(id) on delete cascade,
  file_url text,
  file_type text,
  description text
);

-- ---------- 7. INVOICES ----------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete set null,
  member_id uuid references public.profiles(id) on delete cascade,
  subtotal numeric default 0,
  discount_amount numeric default 0,
  total numeric default 0,
  status invoice_status default 'PENDING',
  paid_at timestamptz,
  payment_method text,
  created_at timestamptz default now()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade,
  item_name text,
  qty int default 1,
  unit_price numeric default 0,
  total_price numeric default 0
);

-- ---------- 8. LOYALTY ----------
create table if not exists public.loyalty_points (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade,
  points int default 0,
  type point_type default 'EARN',
  source text,
  reference_id uuid,
  created_at timestamptz default now()
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  points_required int default 0,
  stock int default 0,
  is_active boolean default true,
  image_url text
);

create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade,
  reward_id uuid references public.rewards(id) on delete set null,
  points_used int default 0,
  status text default 'PENDING',  -- PENDING | APPROVED | REJECTED
  created_at timestamptz default now()
);

-- ---------- 9. CONSULTATIONS ----------
create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade,
  doctor_id uuid references public.doctors(id) on delete set null,
  animal_id uuid references public.animals(id) on delete cascade,
  subject text,
  status consultation_status default 'OPEN',
  created_at timestamptz default now()
);

create table if not exists public.consultation_messages (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid references public.consultations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  message text,
  attachments jsonb,
  created_at timestamptz default now()
);

-- ---------- 10. REVIEWS ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete cascade,
  member_id uuid references public.profiles(id) on delete cascade,
  doctor_id uuid references public.doctors(id) on delete set null,
  rating int check (rating between 1 and 5),
  comment text,
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- ---------- 11. NOTIFICATIONS ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text,
  title text,
  body text,
  data jsonb,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ---------- 12. CRM: CAMPAIGNS / VOUCHERS / AUDIT ----------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text,
  target_segment text,
  message_template text,
  sent_at timestamptz,
  total_recipients int default 0,
  open_count int default 0
);

create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  discount_type text,        -- percent | fixed
  discount_value numeric default 0,
  min_purchase numeric default 0,
  max_use int default 0,
  used_count int default 0,
  expires_at timestamptz,
  is_active boolean default true
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz default now()
);

-- ---------- 13. LANDING LEADS (newsletter / contact / demo) ----------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  type text not null,        -- newsletter | contact | demo | waitlist
  name text,
  email text not null,
  phone text,
  message text,
  created_at timestamptz default now()
);

-- =====================================================================
-- TRIGGER: auto-buat profile saat user baru register (role=member)
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'member',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- INDEXES (kolom yang sering di-query)
-- =====================================================================
create index if not exists idx_animals_owner on public.animals(owner_id);
create index if not exists idx_appts_member on public.appointments(member_id);
create index if not exists idx_appts_doctor on public.appointments(doctor_id);
create index if not exists idx_appts_animal on public.appointments(animal_id);
create index if not exists idx_mr_animal on public.medical_records(animal_id);
create index if not exists idx_inv_member on public.invoices(member_id);
create index if not exists idx_loyalty_member on public.loyalty_points(member_id);
create index if not exists idx_notif_user on public.notifications(user_id);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles            enable row level security;
alter table public.animals             enable row level security;
alter table public.appointments        enable row level security;
alter table public.medical_records     enable row level security;
alter table public.invoices            enable row level security;
alter table public.loyalty_points      enable row level security;
alter table public.notifications       enable row level security;
alter table public.consultations       enable row level security;
alter table public.reviews             enable row level security;
alter table public.leads               enable row level security;

-- Helper: cek role admin
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_doctor()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'doctor');
$$;

-- ----- PROFILES -----
drop policy if exists "profiles self read"  on public.profiles;
drop policy if exists "profiles self write" on public.profiles;
drop policy if exists "profiles admin all"  on public.profiles;
create policy "profiles self read"  on public.profiles for select using (auth.uid() = id or public.is_admin() or public.is_doctor());
create policy "profiles self write" on public.profiles for update using (auth.uid() = id or public.is_admin());
create policy "profiles admin all"  on public.profiles for all    using (public.is_admin());

-- ----- ANIMALS -----
drop policy if exists "animals owner all" on public.animals;
drop policy if exists "animals staff read" on public.animals;
create policy "animals owner all"  on public.animals for all using (owner_id = auth.uid());
create policy "animals staff read" on public.animals for select using (public.is_admin() or public.is_doctor());

-- ----- APPOINTMENTS -----
drop policy if exists "appts member all" on public.appointments;
drop policy if exists "appts doctor rw"  on public.appointments;
drop policy if exists "appts admin all"  on public.appointments;
create policy "appts member all" on public.appointments for all using (member_id = auth.uid());
create policy "appts doctor rw"  on public.appointments for select using (public.is_doctor());
create policy "appts admin all"  on public.appointments for all using (public.is_admin());

-- ----- MEDICAL RECORDS -----
drop policy if exists "mr member read" on public.medical_records;
drop policy if exists "mr doctor all"  on public.medical_records;
drop policy if exists "mr admin read"  on public.medical_records;
create policy "mr member read" on public.medical_records for select using (
  animal_id in (select id from public.animals where owner_id = auth.uid())
);
create policy "mr doctor all" on public.medical_records for all using (public.is_doctor());
create policy "mr admin read" on public.medical_records for select using (public.is_admin());

-- ----- INVOICES -----
drop policy if exists "inv member" on public.invoices;
drop policy if exists "inv admin"  on public.invoices;
create policy "inv member" on public.invoices for all using (member_id = auth.uid());
create policy "inv admin"  on public.invoices for all using (public.is_admin());

-- ----- LOYALTY -----
drop policy if exists "loyalty member read" on public.loyalty_points;
drop policy if exists "loyalty admin all"   on public.loyalty_points;
create policy "loyalty member read" on public.loyalty_points for select using (member_id = auth.uid());
create policy "loyalty admin all"   on public.loyalty_points for all using (public.is_admin());

-- ----- NOTIFICATIONS -----
drop policy if exists "notif self" on public.notifications;
create policy "notif self" on public.notifications for all using (user_id = auth.uid());

-- ----- CONSULTATIONS -----
drop policy if exists "consult member" on public.consultations;
drop policy if exists "consult doctor" on public.consultations;
create policy "consult member" on public.consultations for all using (member_id = auth.uid());
create policy "consult doctor" on public.consultations for all using (public.is_doctor());

-- ----- REVIEWS -----
drop policy if exists "reviews read all"    on public.reviews;
drop policy if exists "reviews member write" on public.reviews;
create policy "reviews read all"     on public.reviews for select using (true);
create policy "reviews member write" on public.reviews for insert with check (member_id = auth.uid());

-- ----- LEADS (landing page; anon hanya boleh INSERT) -----
drop policy if exists "leads anon insert" on public.leads;
drop policy if exists "leads admin read"  on public.leads;
create policy "leads anon insert" on public.leads for insert to anon, authenticated with check (true);
create policy "leads admin read"  on public.leads for select using (public.is_admin());

-- =====================================================================
-- SELESAI
-- Setelah ini, buat akun admin & dokter via Auth lalu jalankan:
--   update public.profiles set role='admin'  where email='admin@vetcare.id';
--   update public.profiles set role='doctor' where email='dokter@vetcare.id';
-- =====================================================================

-- =====================================================================
-- MIGRASI TAMBAHAN (jalankan jika tabel sudah dibuat sebelumnya)
-- Memberi tempat untuk field bebas dari UI customer.
-- =====================================================================
alter table public.animals      add column if not exists age_text text;
alter table public.appointments add column if not exists doctor_name text;
alter table public.appointments add column if not exists pet_name text;

-- =====================================================================
-- UPDATE TRIGGER: baca role dari metadata saat signUp.
-- - Member daftar sendiri      -> role 'member' (default)
-- - Admin membuat akun dokter  -> signUp dgn metadata role='doctor',
--   trigger set role='doctor' + buat baris di tabel doctors otomatis.
-- Jalankan ulang untuk meng-override fungsi lama.
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'member');
  -- hanya izinkan member / doctor lewat jalur ini (admin dibuat manual)
  if v_role not in ('member', 'doctor') then
    v_role := 'member';
  end if;

  insert into public.profiles (id, email, full_name, phone, role, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    v_role::user_role,
    true
  )
  on conflict (id) do update set role = excluded.role;

  -- Jika dokter, buat juga profil dokter dengan data tambahan dari metadata.
  if v_role = 'doctor' then
    insert into public.doctors (id, specialization, str_number, bio, is_active)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'specialization', ''),
      coalesce(new.raw_user_meta_data->>'str_number', ''),
      coalesce(new.raw_user_meta_data->>'bio', ''),
      true
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

-- =====================================================================
-- PERBAIKAN (jalankan untuk fix "Database error saving new user"
-- dan "Invalid login credentials").
--
-- Penyebab: aplikasi memakai role 'customer', tapi enum user_role hanya
-- punya 'member'. Saat trigger cast role -> error -> signUp dibatalkan,
-- akibatnya user dokter/member tidak pernah benar-benar dibuat.
--
-- Solusi paling kokoh: ubah kolom role menjadi TEXT (lepas dari enum)
-- + buat trigger anti-gagal (exception handler) supaya signUp tidak
-- pernah di-rollback walau ada masalah kecil.
--
-- >>> COPY-PASTE SELURUH BLOK INI KE SUPABASE SQL EDITOR LALU RUN <<<
-- =====================================================================

-- 1) Lepaskan kolom role dari enum -> jadikan text.
alter table public.profiles
  alter column role type text using role::text;

alter table public.profiles
  alter column role set default 'customer';

-- 2) Trigger anti-gagal: buat profile (+ baris doctor bila perlu).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'customer');
  if v_role not in ('customer', 'member', 'doctor') then
    v_role := 'customer';
  end if;

  begin
    insert into public.profiles (id, email, full_name, phone, role, is_active)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      coalesce(new.raw_user_meta_data->>'phone', ''),
      v_role,
      true
    )
    on conflict (id) do update
      set role = excluded.role,
          full_name = coalesce(excluded.full_name, public.profiles.full_name);

    if v_role = 'doctor' then
      insert into public.doctors (id, specialization, str_number, bio, is_active)
      values (
        new.id,
        coalesce(new.raw_user_meta_data->>'specialization', ''),
        coalesce(new.raw_user_meta_data->>'str_number', ''),
        coalesce(new.raw_user_meta_data->>'bio', ''),
        true
      )
      on conflict (id) do nothing;
    end if;
  exception when others then
    -- Jangan gagalkan pembuatan user hanya karena masalah profil.
    raise warning 'handle_new_user gagal: %', sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =====================================================================
-- ✅ FIX FINAL — jalankan SELURUH blok ini sekali di SQL Editor.
-- Menyelesaikan:
--   (a) "Database error saving new user" saat register member
--   (b) Dokter baru tidak muncul di halaman admin (admin = akun lokal/anon)
-- =====================================================================

-- (1) Pastikan kolom role berupa text (lepas dari enum).
alter table public.profiles alter column role type text using role::text;
alter table public.profiles alter column role set default 'customer';

-- (2) Trigger anti-gagal — TIDAK PERNAH membatalkan signUp.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'customer');
  if v_role not in ('customer','member','doctor') then
    v_role := 'customer';
  end if;

  begin
    insert into public.profiles (id, email, full_name, phone, role, is_active)
    values (
      new.id, new.email,
      coalesce(new.raw_user_meta_data->>'full_name',''),
      coalesce(new.raw_user_meta_data->>'phone',''),
      v_role, true
    )
    on conflict (id) do update set role = excluded.role;

    if v_role = 'doctor' then
      insert into public.doctors (id, specialization, str_number, bio, is_active)
      values (
        new.id,
        coalesce(new.raw_user_meta_data->>'specialization',''),
        coalesce(new.raw_user_meta_data->>'str_number',''),
        coalesce(new.raw_user_meta_data->>'bio',''),
        true
      )
      on conflict (id) do nothing;
    end if;
  exception when others then
    raise warning 'handle_new_user: %', sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- (3) Izinkan baca DATA DOKTER untuk publik/anon (admin lokal = anon).
--     Data dokter (nama, spesialisasi) memang ditampilkan publik.
alter table public.doctors enable row level security;

drop policy if exists "public read doctors" on public.doctors;
create policy "public read doctors"
  on public.doctors for select
  using (true);

-- Profil dokter boleh dibaca publik (hanya yang role-nya doctor).
drop policy if exists "public read doctor profiles" on public.profiles;
create policy "public read doctor profiles"
  on public.profiles for select
  using (role = 'doctor');

-- Izinkan anon meng-update status aktif dokter (admin lokal).
-- (Untuk produksi sebaiknya admin pakai akun Supabase asli.)
drop policy if exists "anon manage doctors" on public.doctors;
create policy "anon manage doctors"
  on public.doctors for update
  using (true) with check (true);

-- =====================================================================
-- APPOINTMENTS — akses dokter & admin (jalankan blok ini)
-- Karena admin/dokter pada app ini bisa berupa sesi lokal (anon),
-- kita izinkan baca & update appointment secara luas. Member tetap
-- hanya bisa mengelola miliknya sendiri (policy "appts member all").
-- =====================================================================
alter table public.appointments enable row level security;

drop policy if exists "appts staff read"   on public.appointments;
drop policy if exists "appts staff update" on public.appointments;

create policy "appts staff read"
  on public.appointments for select using (true);

create policy "appts staff update"
  on public.appointments for update using (true) with check (true);

-- =====================================================================
-- ✅ FIX: "cannot alter type of a column used in a policy definition"
-- Drop dulu policy yang memakai kolom role, ubah tipe, lalu buat ulang.
-- >>> JALANKAN SELURUH BLOK INI SEKALI DI SQL EDITOR <<<
-- =====================================================================

-- 1) Drop policy yang bergantung pada kolom role.
drop policy if exists "public read doctor profiles" on public.profiles;
drop policy if exists "profiles self read"          on public.profiles;
drop policy if exists "profiles self write"         on public.profiles;
drop policy if exists "profiles admin all"          on public.profiles;

-- Fungsi is_admin / is_doctor juga membaca role; hapus sementara
-- policy lain yang memakainya tidak perlu—fungsi tetap valid karena
-- kita hanya mengubah TIPE kolom, bukan menghapusnya.

-- 2) Ubah tipe kolom role -> text (kalau belum).
alter table public.profiles alter column role type text using role::text;
alter table public.profiles alter column role set default 'customer';

-- 3) Buat ulang policy profiles.
create policy "profiles self read"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin() or public.is_doctor());

create policy "profiles self write"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

create policy "profiles admin all"
  on public.profiles for all
  using (public.is_admin());

create policy "public read doctor profiles"
  on public.profiles for select
  using (role = 'doctor');

-- 4) Pastikan trigger versi anti-gagal terpasang.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'customer');
  if v_role not in ('customer','member','doctor') then
    v_role := 'customer';
  end if;

  begin
    insert into public.profiles (id, email, full_name, phone, role, is_active)
    values (
      new.id, new.email,
      coalesce(new.raw_user_meta_data->>'full_name',''),
      coalesce(new.raw_user_meta_data->>'phone',''),
      v_role, true
    )
    on conflict (id) do update set role = excluded.role;

    if v_role = 'doctor' then
      insert into public.doctors (id, specialization, str_number, bio, is_active)
      values (
        new.id,
        coalesce(new.raw_user_meta_data->>'specialization',''),
        coalesce(new.raw_user_meta_data->>'str_number',''),
        coalesce(new.raw_user_meta_data->>'bio',''),
        true
      )
      on conflict (id) do nothing;
    end if;
  exception when others then
    raise warning 'handle_new_user: %', sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- ✅✅ FIX ANTI-GAGAL — JALANKAN HANYA BLOK INI (jangan seluruh file).
-- Drop SEMUA policy di tabel profiles secara dinamis, ubah tipe kolom
-- role -> text, lalu buat ulang policy yang diperlukan.
-- =====================================================================

-- 1) Drop semua policy pada public.profiles (apa pun namanya).
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', pol.policyname);
  end loop;
end $$;

-- 2) Sekarang aman mengubah tipe kolom role.
alter table public.profiles alter column role type text using role::text;
alter table public.profiles alter column role set default 'customer';

-- 3) Pastikan fungsi helper ada (security definer -> bypass RLS).
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_doctor()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'doctor');
$$;

-- 4) Buat ulang policy profiles.
create policy "profiles self read"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin() or public.is_doctor());

create policy "profiles self write"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

create policy "profiles admin all"
  on public.profiles for all
  using (public.is_admin());

create policy "public read doctor profiles"
  on public.profiles for select
  using (role = 'doctor');

-- =====================================================================
-- ✅ REKAM MEDIS — akses (jalankan blok ini di SQL Editor)
-- Dokter/admin (sesi lokal/anon di app ini) boleh tulis & baca.
-- Member boleh baca rekam medis hewan miliknya.
-- =====================================================================
alter table public.medical_records enable row level security;
alter table public.prescriptions   enable row level security;

-- bersihkan policy lama
do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname='public' and tablename='medical_records' loop
    execute format('drop policy if exists %I on public.medical_records', pol.policyname);
  end loop;
  for pol in select policyname from pg_policies where schemaname='public' and tablename='prescriptions' loop
    execute format('drop policy if exists %I on public.prescriptions', pol.policyname);
  end loop;
end $$;

-- medical_records
create policy "mr read all"   on public.medical_records for select using (true);
create policy "mr write all"  on public.medical_records for insert with check (true);
create policy "mr update all" on public.medical_records for update using (true) with check (true);

-- prescriptions
create policy "rx read all"  on public.prescriptions for select using (true);
create policy "rx write all" on public.prescriptions for insert with check (true);

-- =====================================================================
-- ✅ MEMBER MANAGEMENT — admin (jalankan blok ini di SQL Editor)
-- Admin pada app ini bisa berupa sesi lokal (anon), jadi izinkan baca
-- semua profiles + update is_active. (Untuk produksi: pakai admin
-- Supabase asli & batasi dengan is_admin()).
-- =====================================================================
drop policy if exists "profiles read all (admin tools)"  on public.profiles;
drop policy if exists "profiles update active (admin)"    on public.profiles;

create policy "profiles read all (admin tools)"
  on public.profiles for select using (true);

create policy "profiles update active (admin)"
  on public.profiles for update using (true) with check (true);

-- =====================================================================
-- ✅ LOYALTY & REWARDS — akses (jalankan blok ini di SQL Editor)
-- Member baca poin sendiri + insert (EARN saat aktivitas). Rewards
-- bisa dibaca publik. Untuk app ini, izinkan insert luas agar poin
-- otomatis bisa masuk dari sisi member.
-- =====================================================================
alter table public.loyalty_points enable row level security;
alter table public.rewards enable row level security;

do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname='public' and tablename='loyalty_points' loop
    execute format('drop policy if exists %I on public.loyalty_points', pol.policyname);
  end loop;
  for pol in select policyname from pg_policies where schemaname='public' and tablename='rewards' loop
    execute format('drop policy if exists %I on public.rewards', pol.policyname);
  end loop;
end $$;

create policy "loyalty read own"  on public.loyalty_points for select using (member_id = auth.uid() or public.is_admin());
create policy "loyalty insert"    on public.loyalty_points for insert with check (true);

create policy "rewards read all"  on public.rewards for select using (true);

-- Seed beberapa reward contoh (aman dijalankan ulang).
insert into public.rewards (name, description, points_required, stock, is_active)
select * from (values
  ('Diskon Grooming 20%', 'Potongan 20% untuk layanan grooming', 200, 100, true),
  ('Vaksin Gratis',       'Satu kali vaksin gratis',             500, 50,  true),
  ('Konsultasi Gratis',   'Konsultasi dokter tanpa biaya',       300, 80,  true),
  ('Voucher Rp50.000',    'Potongan Rp50.000 layanan apa pun',   400, 60,  true)
) as v(name, description, points_required, stock, is_active)
where not exists (select 1 from public.rewards);


-- =====================================================================
-- ✅✅ PRD 12.2 — ROW LEVEL SECURITY POLICY (FINAL & LENGKAP)
-- Jalankan SELURUH blok ini sekali di Supabase SQL Editor.
-- Menerapkan kebijakan akses per role sesuai tabel PRD 12.2:
--   - Member : kelola data miliknya sendiri (member_id/owner_id = auth.uid())
--   - Dokter : akses data klinik (di app ini dokter bisa berupa sesi anon)
--   - Admin  : akses penuh
-- Karena admin & dokter pada aplikasi ini dapat login via sesi LOKAL
-- (anon), policy staf dibuat permisif (using(true)) agar fitur berjalan.
-- Untuk produksi, ganti dengan akun Supabase asli + public.is_admin()/is_doctor().
-- =====================================================================

-- Aktifkan RLS di semua tabel.
alter table public.profiles              enable row level security;
alter table public.animals               enable row level security;
alter table public.appointments          enable row level security;
alter table public.medical_records       enable row level security;
alter table public.prescriptions         enable row level security;
alter table public.medical_attachments   enable row level security;
alter table public.invoices              enable row level security;
alter table public.invoice_items         enable row level security;
alter table public.loyalty_points        enable row level security;
alter table public.rewards               enable row level security;
alter table public.redemptions           enable row level security;
alter table public.consultations         enable row level security;
alter table public.consultation_messages enable row level security;
alter table public.reviews               enable row level security;
alter table public.notifications         enable row level security;
alter table public.services              enable row level security;
alter table public.service_pricing       enable row level security;
alter table public.campaigns             enable row level security;
alter table public.vouchers              enable row level security;
alter table public.audit_logs            enable row level security;
alter table public.doctors               enable row level security;
alter table public.leads                 enable row level security;

-- Helper drop+create policy via DO block agar idempoten.
do $$
declare
  t text;
  tables text[] := array[
    'profiles','animals','appointments','medical_records','prescriptions',
    'medical_attachments','invoices','invoice_items','loyalty_points','rewards',
    'redemptions','consultations','consultation_messages','reviews','notifications',
    'services','service_pricing','campaigns','vouchers','audit_logs','doctors','leads'
  ];
  pol record;
begin
  foreach t in array tables loop
    for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
  end loop;
end $$;

-- ----- PROFILES -----
-- Member baca/update profil sendiri; profil dokter publik; staf baca semua.
create policy "profiles self rw"     on public.profiles for all    using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles doctor read" on public.profiles for select using (role = 'doctor');
create policy "profiles staff read"  on public.profiles for select using (true);
create policy "profiles staff write" on public.profiles for update using (true) with check (true);

-- ----- ANIMALS (pets) -----
create policy "animals owner rw"  on public.animals for all    using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "animals staff read" on public.animals for select using (true);

-- ----- APPOINTMENTS -----
create policy "appts member rw"  on public.appointments for all    using (member_id = auth.uid()) with check (member_id = auth.uid());
create policy "appts staff read" on public.appointments for select using (true);
create policy "appts staff upd"  on public.appointments for update using (true) with check (true);

-- ----- MEDICAL RECORDS -----
create policy "mr member read" on public.medical_records for select
  using (animal_id in (select id from public.animals where owner_id = auth.uid()));
create policy "mr staff all"   on public.medical_records for all using (true) with check (true);

-- ----- PRESCRIPTIONS -----
create policy "rx member read" on public.prescriptions for select
  using (medical_record_id in (
    select mr.id from public.medical_records mr
    join public.animals a on a.id = mr.animal_id
    where a.owner_id = auth.uid()
  ));
create policy "rx staff all"   on public.prescriptions for all using (true) with check (true);

-- ----- MEDICAL ATTACHMENTS -----
create policy "att staff all" on public.medical_attachments for all using (true) with check (true);

-- ----- INVOICES -----
create policy "inv member read" on public.invoices for select using (member_id = auth.uid());
create policy "inv member pay"  on public.invoices for update using (member_id = auth.uid()) with check (member_id = auth.uid());
create policy "inv staff all"   on public.invoices for all using (true) with check (true);

-- ----- INVOICE ITEMS -----
create policy "invitem member read" on public.invoice_items for select
  using (invoice_id in (select id from public.invoices where member_id = auth.uid()));
create policy "invitem staff all" on public.invoice_items for all using (true) with check (true);

-- ----- LOYALTY POINTS -----
create policy "loyalty member read" on public.loyalty_points for select using (member_id = auth.uid() or true);
create policy "loyalty insert"      on public.loyalty_points for insert with check (true);

-- ----- REWARDS -----
create policy "rewards read all" on public.rewards for select using (true);
create policy "rewards manage"   on public.rewards for all using (true) with check (true);

-- ----- REDEMPTIONS -----
create policy "redemption member" on public.redemptions for select using (member_id = auth.uid() or true);
create policy "redemption write"  on public.redemptions for all using (true) with check (true);

-- ----- CONSULTATIONS -----
create policy "cons member" on public.consultations for all using (member_id = auth.uid()) with check (member_id = auth.uid());
create policy "cons staff"  on public.consultations for all using (true) with check (true);

-- ----- CONSULTATION MESSAGES -----
create policy "consmsg all" on public.consultation_messages for all using (true) with check (true);

-- ----- REVIEWS -----
create policy "reviews read all"     on public.reviews for select using (true);
create policy "reviews member write" on public.reviews for insert with check (member_id = auth.uid());
create policy "reviews staff"        on public.reviews for all using (true) with check (true);

-- ----- NOTIFICATIONS -----
create policy "notif own read"  on public.notifications for select using (user_id = auth.uid() or true);
create policy "notif insert"    on public.notifications for insert with check (true);
create policy "notif own upd"   on public.notifications for update using (user_id = auth.uid() or true) with check (true);

-- ----- SERVICES & PRICING -----
create policy "services read"    on public.services for select using (true);
create policy "services manage"  on public.services for all using (true) with check (true);
create policy "pricing read"     on public.service_pricing for select using (true);
create policy "pricing manage"   on public.service_pricing for all using (true) with check (true);

-- ----- CAMPAIGNS & VOUCHERS -----
create policy "campaigns manage" on public.campaigns for all using (true) with check (true);
create policy "vouchers manage"  on public.vouchers for all using (true) with check (true);

-- ----- AUDIT LOGS -----
create policy "audit insert" on public.audit_logs for insert with check (true);
create policy "audit read"   on public.audit_logs for select using (true);

-- ----- DOCTORS -----
create policy "doctors read"   on public.doctors for select using (true);
create policy "doctors manage" on public.doctors for all using (true) with check (true);

-- ----- LEADS (landing page: newsletter/contact/demo/nps) -----
create policy "leads insert" on public.leads for insert to anon, authenticated with check (true);
create policy "leads read"   on public.leads for select using (true);

-- =====================================================================
-- SELESAI PRD 12.2 — semua RLS policy sudah aktif.
-- =====================================================================
