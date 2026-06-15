-- =====================================================================
-- VetCare — Skema Database Supabase
-- Jalankan skrip ini di Supabase Dashboard → SQL Editor → New Query
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABEL PROFILES
--    Menyimpan data tambahan user + role (admin / doctor / customer).
--    Terhubung 1:1 dengan auth.users.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       varchar(255) unique not null,
  full_name   varchar(255) not null,
  phone       varchar(20),
  role        varchar(20) not null default 'customer'
              check (role in ('admin', 'doctor', 'customer')),
  avatar_url  text,
  is_active   boolean default true,
  last_login  timestamp,
  created_at  timestamp default now(),
  updated_at  timestamp default now()
);

-- Auto-update kolom updated_at setiap kali baris profil diubah.
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();


-- ---------------------------------------------------------------------
-- 2. TABEL PETS (Hewan yang didaftarkan customer)
-- ---------------------------------------------------------------------
create table if not exists public.pets (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  nama        text not null,
  jenis       text not null default 'Kucing',
  ras         text,
  umur        text,
  keluhan     text,
  status      text not null default 'Pending'
              check (status in ('Pending', 'Diterima', 'Selesai', 'Dibatalkan')),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. TABEL PROMOTIONS (Promosi / penawaran klinik)
-- ---------------------------------------------------------------------
create table if not exists public.promotions (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  badge        text,
  icon         text default 'gift',          -- nama icon: syringe | cut | stethoscope | gift
  color        text default '#16c784',
  valid_until  text,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. TABEL PAYMENTS (Tagihan / pembayaran customer)
-- ---------------------------------------------------------------------
create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  pet_id      uuid references public.pets (id) on delete set null,
  invoice     text not null,
  hewan       text,
  layanan     text,
  total       numeric not null default 0,
  status      text not null default 'Pending'
              check (status in ('Pending', 'Lunas', 'Dibatalkan')),
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================
alter table public.profiles    enable row level security;
alter table public.pets        enable row level security;
alter table public.promotions  enable row level security;
alter table public.payments    enable row level security;

-- ---------------------------------------------------------------------
-- Helper: cek apakah user saat ini adalah admin
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------
-- POLICIES: PROFILES
-- ---------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

-- ---------------------------------------------------------------------
-- POLICIES: PETS  (customer hanya bisa akses hewan miliknya)
-- ---------------------------------------------------------------------
drop policy if exists "pets_select_own" on public.pets;
create policy "pets_select_own"
  on public.pets for select
  using (auth.uid() = owner_id or public.is_admin());

drop policy if exists "pets_insert_own" on public.pets;
create policy "pets_insert_own"
  on public.pets for insert
  with check (auth.uid() = owner_id);

drop policy if exists "pets_update_own" on public.pets;
create policy "pets_update_own"
  on public.pets for update
  using (auth.uid() = owner_id or public.is_admin());

drop policy if exists "pets_delete_own" on public.pets;
create policy "pets_delete_own"
  on public.pets for delete
  using (auth.uid() = owner_id or public.is_admin());

-- ---------------------------------------------------------------------
-- POLICIES: PROMOTIONS  (semua user login bisa lihat, admin kelola)
-- ---------------------------------------------------------------------
drop policy if exists "promotions_select_all" on public.promotions;
create policy "promotions_select_all"
  on public.promotions for select
  using (auth.role() = 'authenticated');

drop policy if exists "promotions_admin_write" on public.promotions;
create policy "promotions_admin_write"
  on public.promotions for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------
-- POLICIES: PAYMENTS  (customer hanya bisa akses tagihan miliknya)
-- ---------------------------------------------------------------------
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
  on public.payments for select
  using (auth.uid() = owner_id or public.is_admin());

drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own"
  on public.payments for insert
  with check (auth.uid() = owner_id or public.is_admin());

drop policy if exists "payments_update_own" on public.payments;
create policy "payments_update_own"
  on public.payments for update
  using (auth.uid() = owner_id or public.is_admin());

-- =====================================================================
-- TRIGGER: Auto-buat profil saat user baru mendaftar (opsional tapi disarankan)
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    'customer'
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
-- SEED DATA: Promosi contoh (boleh dihapus / disesuaikan)
-- =====================================================================
insert into public.promotions (title, description, badge, icon, color, valid_until, active)
values
  ('Promo Vaksin',
   'Diskon spesial untuk paket vaksinasi lengkap. Lindungi hewan kesayangan Anda dari penyakit.',
   '25% OFF', 'syringe', '#16c784', 'Berlaku s/d 30 Juni 2026', true),
  ('Paket Bundling',
   'Hemat lebih banyak dengan paket bundling pemeriksaan + grooming + vitamin dalam satu harga.',
   'HEMAT', 'bundle', '#3b82f6', 'Kuota terbatas', true),
  ('Promo Grooming',
   'Gratis potong kuku untuk setiap layanan grooming di akhir pekan. Hewan bersih & wangi.',
   'GRATIS', 'cut', '#f59e0b', 'Setiap Sabtu & Minggu', true),
  ('Promo Member',
   'Daftar jadi member VetCare dan nikmati potongan harga di setiap transaksi serta poin reward.',
   'MEMBER', 'member', '#a855f7', 'Program berkelanjutan', true),
  ('Promo Ulang Tahun Hewan',
   'Rayakan ulang tahun hewan kesayangan dengan hadiah spesial & diskon layanan di hari spesialnya.',
   'SPESIAL', 'birthday', '#ec4899', 'Di bulan ulang tahun hewan', true)
on conflict do nothing;

-- =====================================================================
-- SELESAI
-- =====================================================================
