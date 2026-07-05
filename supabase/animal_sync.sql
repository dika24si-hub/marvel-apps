-- Sinkron Data Hewan Member/Admin
-- Jalankan di Supabase SQL Editor.
-- Kontrak aplikasi:
--   public.animals.gender = jenis kelamin hewan
--   public.animals.foto   = URL foto hewan

ALTER TABLE public.animals
  ADD COLUMN IF NOT EXISTS gender TEXT;

ALTER TABLE public.animals
  ADD COLUMN IF NOT EXISTS foto TEXT;

-- Batasi nilai gender untuk data baru/update berikutnya.
-- NOT VALID supaya data lama yang masih NULL tidak langsung menggagalkan migrasi.
ALTER TABLE public.animals
  DROP CONSTRAINT IF EXISTS animals_gender_valid;

ALTER TABLE public.animals
  ADD CONSTRAINT animals_gender_valid
  CHECK (gender IS NULL OR gender IN ('Jantan', 'Betina')) NOT VALID;

-- RLS wajib untuk sinkron member -> admin.
-- Member yang login Supabase boleh insert/update/delete hewan miliknya sendiri.
-- Admin pada aplikasi ini memakai login lokal, sehingga browser memakai role anon;
-- karena itu halaman admin butuh SELECT public pada animals dan profiles.
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "animals owner insert" ON public.animals;
DROP POLICY IF EXISTS "animals owner update" ON public.animals;
DROP POLICY IF EXISTS "animals owner delete" ON public.animals;
DROP POLICY IF EXISTS "animals read all for admin pages" ON public.animals;
DROP POLICY IF EXISTS "profiles read all for admin pages" ON public.profiles;

CREATE POLICY "animals owner insert"
  ON public.animals
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "animals owner update"
  ON public.animals
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "animals owner delete"
  ON public.animals
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "animals read all for admin pages"
  ON public.animals
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "profiles read all for admin pages"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Aktifkan realtime untuk auto-refresh Data Hewan admin.
-- Abaikan error duplicate kalau tabel sudah pernah ditambahkan ke publication.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.animals;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Cek data lama yang masih harus dilengkapi manual.
SELECT id, owner_id, name, gender, foto, created_at
FROM public.animals
WHERE gender IS NULL OR gender = '' OR foto IS NULL OR foto = ''
ORDER BY created_at DESC;

-- Perbaiki data yang sudah terlanjur kosong dengan mengganti ID_HEWAN.
-- UPDATE public.animals SET gender = 'Jantan' WHERE id = 'ID_HEWAN';
-- UPDATE public.animals SET gender = 'Betina' WHERE id = 'ID_HEWAN';

-- Setelah data lama sudah lengkap, kalau ingin memaksa data ke depan tidak boleh kosong,
-- jalankan dua perintah ini:
-- ALTER TABLE public.animals ALTER COLUMN gender SET NOT NULL;
-- ALTER TABLE public.animals ALTER COLUMN foto SET NOT NULL;
