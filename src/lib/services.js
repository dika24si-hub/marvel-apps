import { supabase } from "./supabase";

// =====================================================================
// PETS — Hewan milik customer
// =====================================================================

export async function getPetsByOwner(ownerId) {
  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createPet(pet) {
  const { data, error } = await supabase
    .from("pets")
    .insert(pet)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePet(id, updates) {
  const { data, error } = await supabase
    .from("pets")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePet(id) {
  const { error } = await supabase.from("pets").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// =====================================================================
// PAYMENTS — Tagihan / pembayaran customer
// =====================================================================

export async function getPaymentsByOwner(ownerId) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function payPayment(id) {
  const { data, error } = await supabase
    .from("payments")
    .update({ status: "Lunas", paid_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =====================================================================
// PROMOTIONS — Promosi klinik
// =====================================================================

export async function getActivePromotions() {
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// =====================================================================
// LANDING LEADS — Newsletter / Contact / Demo Request / Waiting List
// Tabel Supabase: `leads`
//   kolom: id (uuid), type (text), name (text), email (text),
//          phone (text), message (text), created_at (timestamptz default now())
//
// SQL setup (jalankan di Supabase SQL editor):
//   create table public.leads (
//     id uuid primary key default gen_random_uuid(),
//     type text not null,
//     name text,
//     email text not null,
//     phone text,
//     message text,
//     created_at timestamptz default now()
//   );
//   alter table public.leads enable row level security;
//   create policy "anon can insert leads"
//     on public.leads for insert to anon with check (true);
// =====================================================================

/**
 * Simpan lead dari landing page.
 * @param {{type:"newsletter"|"contact"|"demo"|"waitlist", email:string, name?:string, phone?:string, message?:string}} lead
 */
export async function submitLead(lead) {
  const payload = {
    type: lead.type,
    name: lead.name?.trim() || null,
    email: lead.email?.trim(),
    phone: lead.phone?.trim() || null,
    message: lead.message?.trim() || null,
  };

  const { data, error } = await supabase
    .from("leads")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =====================================================================
// CONTACT & DEMO REQUEST (PRD V3)
// Memakai tabel `leads` yang sama (type: "contact" | "demo").
// =====================================================================

/** Kirim pesan dari Contact form. */
export async function submitContact({ name, email, message }) {
  return submitLead({ type: "contact", name, email, message });
}

/** Kirim permintaan demo. */
export async function submitDemoRequest({ name, email, phone }) {
  return submitLead({ type: "demo", name, email, phone });
}

// =====================================================================
// DOCTORS — daftar dokter (gabung profiles + doctors di sisi JS)
// Dibuat tahan banting: tidak bergantung pada nama foreign key.
// =====================================================================

/** Ambil semua dokter beserta data profil. */
export async function getDoctors() {
  // 1. Ambil baris dokter.
  const { data: docs, error: docErr } = await supabase
    .from("doctors")
    .select("id, specialization, str_number, bio, is_active, rating_avg");
  if (docErr) throw docErr;

  const list = docs || [];
  if (list.length === 0) return [];

  // 2. Ambil profil yang role-nya doctor (untuk nama/email/telepon).
  const ids = list.map((d) => d.id);
  const { data: profs, error: profErr } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, is_active")
    .in("id", ids);
  if (profErr) throw profErr;

  const profMap = Object.fromEntries((profs || []).map((p) => [p.id, p]));

  // 3. Gabung.
  return list.map((d) => ({
    ...d,
    profile: profMap[d.id] || null,
  }));
}

/** Aktif/nonaktifkan dokter. */
export async function setDoctorActive(id, isActive) {
  const { error } = await supabase
    .from("doctors")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw error;
  return true;
}

// =====================================================================
// APPOINTMENTS — untuk DOKTER & ADMIN (PRD 11.1 Appointment Flow)
// Status: PENDING -> CONFIRMED -> COMPLETED / CANCELLED / NO_SHOW
// =====================================================================

/**
 * Ambil semua janji temu (untuk dokter/admin).
 * Karena pet_name & doctor_name sudah disimpan denormalized di tabel
 * appointments, kita tidak perlu join berat.
 */
export async function getAllAppointments() {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

/** Ubah status janji temu. */
export async function updateAppointmentStatus(id, status) {
  // 1. Update status. Tidak pakai .single() pada RETURNING agar tidak
  //    error saat RLS membatasi baris hasil (mis. dokter sesi lokal/anon).
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);
  if (error) throw error;

  // 2. Ambil ulang baris untuk verifikasi + data notifikasi.
  let data = null;
  try {
    const res = await supabase
      .from("appointments")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    data = res.data;
  } catch {
    // abaikan; lanjut ke verifikasi.
  }

  // 3. Verifikasi: jika baris terbaca tapi status TIDAK berubah, berarti
  //    UPDATE diblokir RLS (kena 0 baris). Beri error yang jelas.
  if (data && data.status !== status) {
    throw new Error(
      "Perubahan status tidak tersimpan (kemungkinan policy UPDATE appointments belum aktif di Supabase)."
    );
  }

  // 4. Notifikasi ke member sesuai perubahan status (PRD 7.9).
  try {
    if (data?.member_id) {
      const map = {
        CONFIRMED: {
          type: "appointment",
          title: "Janji temu dikonfirmasi",
          body: `Janji untuk ${data.pet_name || "hewan"} telah dikonfirmasi dokter.`,
        },
        CANCELLED: {
          type: "appointment",
          title: "Janji temu ditolak/dibatalkan",
          body: `Janji untuk ${data.pet_name || "hewan"} dibatalkan. Silakan jadwalkan ulang.`,
        },
        COMPLETED: {
          type: "appointment",
          title: "Pemeriksaan selesai",
          body: `Pemeriksaan ${data.pet_name || "hewan"} selesai. Rekam medis telah diperbarui.`,
        },
      };
      const n = map[status];
      if (n) await createNotification({ userId: data.member_id, ...n });
    }
  } catch (e) {
    console.error("Gagal membuat notifikasi status:", e.message);
  }

  return data;
}

// =====================================================================
// MEDICAL RECORDS — rekam medis (PRD 8.4 & 11.3)
// Dibuat oleh dokter, dilihat oleh member (read-only).
// =====================================================================

/** Buat rekam medis baru + tandai appointment COMPLETED. */
export async function createMedicalRecord(rec) {
  const payload = {
    appointment_id: rec.appointmentId ?? null,
    doctor_id: rec.doctorId ?? null,
    animal_id: rec.animalId ?? null,
    weight_at_visit: rec.weight ? Number(rec.weight) : null,
    temperature: rec.temperature ? Number(rec.temperature) : null,
    physical_exam_notes: rec.examNotes?.trim() || null,
    diagnosis: rec.diagnosis?.trim() || null,
    actions_taken: rec.actions?.trim() || null,
    follow_up_date: rec.followUpDate || null,
  };

  const { data, error } = await supabase
    .from("medical_records")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;

  // Resep (opsional, satu baris ringkas).
  if (rec.drugName?.trim()) {
    await supabase.from("prescriptions").insert({
      medical_record_id: data.id,
      drug_name: rec.drugName.trim(),
      dosage: rec.dosage?.trim() || null,
      frequency: rec.frequency?.trim() || null,
      duration_days: rec.durationDays ? Number(rec.durationDays) : null,
      notes: rec.drugNotes?.trim() || null,
    });
  }

  // Tandai appointment selesai + beri poin loyalty ke member.
  if (rec.appointmentId) {
    await supabase
      .from("appointments")
      .update({ status: "COMPLETED" })
      .eq("id", rec.appointmentId);

    // Cari member pemilik appointment, lalu beri poin (PRD 11.4).
    // Disederhanakan: poin masuk saat kunjungan selesai (COMPLETED).
    try {
      const { data: appt } = await supabase
        .from("appointments")
        .select("member_id")
        .eq("id", rec.appointmentId)
        .single();
      if (appt?.member_id) {
        await addPoints(
          appt.member_id,
          POINTS_PER_VISIT,
          "Kunjungan selesai",
          rec.appointmentId
        );

        // Buat invoice otomatis dari item layanan/obat (PRD 12 & 11.6).
        // Diskon tier (Gold/Platinum) diterapkan otomatis.
        try {
          await createInvoiceForVisit({
            memberId: appt.member_id,
            appointmentId: rec.appointmentId,
            items: rec.invoiceItems || [],
          });
        } catch (e) {
          console.error("Gagal membuat invoice otomatis:", e.message);
        }
      }
    } catch (e) {
      // Jangan gagalkan pembuatan rekam medis bila pemberian poin gagal.
      console.error("Gagal memberi poin loyalty:", e.message);
    }
  }

  return data;
}

/**
 * Buat invoice otomatis untuk satu kunjungan (PRD 12).
 * - items: [{ name, qty, price }]. Jika kosong, dilewati.
 * - Diskon tier diterapkan otomatis dari total poin loyalty member.
 * - Invoice berstatus PENDING; member membayar lewat halaman Pembayaran.
 */
export async function createInvoiceForVisit({ memberId, appointmentId = null, items = [] }) {
  const cleanItems = (items || [])
    .filter((it) => it && it.name && Number(it.price) > 0)
    .map((it) => ({
      item_name: it.name.trim(),
      qty: Number(it.qty) || 1,
      unit_price: Number(it.price) || 0,
      total_price: (Number(it.qty) || 1) * (Number(it.price) || 0),
    }));

  if (cleanItems.length === 0) return null;

  const subtotal = cleanItems.reduce((s, it) => s + it.total_price, 0);

  // Diskon dari tier loyalty member.
  let discountPct = 0;
  try {
    const { tier } = await getLoyalty(memberId);
    discountPct = tier?.discount || 0;
  } catch {
    discountPct = 0;
  }
  const discountAmount = Math.round((subtotal * discountPct) / 100);
  const total = subtotal - discountAmount;

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      appointment_id: appointmentId,
      member_id: memberId,
      subtotal,
      discount_amount: discountAmount,
      total,
      status: "PENDING",
    })
    .select()
    .single();
  if (error) throw error;

  // Item invoice.
  await supabase.from("invoice_items").insert(
    cleanItems.map((it) => ({ ...it, invoice_id: invoice.id }))
  );

  // Notifikasi tagihan baru ke member (PRD 11.6).
  try {
    await createNotification({
      userId: memberId,
      type: "payment",
      title: "Tagihan baru",
      body: `Tagihan kunjungan sebesar ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(total)} menunggu pembayaran.`,
    });
  } catch (e) {
    console.error("Notif invoice gagal:", e.message);
  }

  return invoice;
}

/** Ambil rekam medis untuk satu hewan (untuk member di Pet Detail). */
export async function getMedicalRecordsByAnimal(animalId) {
  const { data, error } = await supabase
    .from("medical_records")
    .select("*, prescriptions(*)")
    .eq("animal_id", animalId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Ambil semua rekam medis (untuk dokter/admin). */
export async function getAllMedicalRecords() {
  const { data, error } = await supabase
    .from("medical_records")
    .select("*, prescriptions(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// =====================================================================
// ADMIN DASHBOARD — ringkasan statistik (PRD 9.1)
// =====================================================================

/** Ambil KPI ringkas untuk dashboard admin dari data nyata. */
export async function getAdminStats() {
  const [membersR, doctorsR, petsR, apptR] = await Promise.all([
    supabase.from("profiles").select("id, role, created_at"),
    supabase.from("doctors").select("id, is_active"),
    supabase.from("animals").select("id"),
    supabase.from("appointments").select("id, status, scheduled_at, complaint, pet_name, doctor_name, created_at"),
  ]);

  if (membersR.error) throw membersR.error;
  const profiles = membersR.data || [];
  const doctors = doctorsR.data || [];
  const pets = petsR.data || [];
  const appts = apptR.data || [];

  const members = profiles.filter((p) => p.role === "customer" || p.role === "member");

  // Hitung appointment per status
  const byStatus = appts.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  // Member baru bulan ini
  const now = new Date();
  const newThisMonth = members.filter((m) => {
    const d = new Date(m.created_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  return {
    totalMembers: members.length,
    totalDoctors: doctors.length,
    activeDoctors: doctors.filter((d) => d.is_active).length,
    totalPets: pets.length,
    totalAppointments: appts.length,
    newMembersThisMonth: newThisMonth,
    byStatus,
    appointments: appts,
  };
}

// =====================================================================
// MEMBER MANAGEMENT — Admin (PRD 9.2)
// =====================================================================

/** Ambil semua member (role customer/member) + jumlah hewan. */
export async function getMembers() {
  const { data: profs, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, city, role, is_active, created_at, last_login")
    .in("role", ["customer", "member"])
    .order("created_at", { ascending: false });
  if (error) throw error;

  const members = profs || [];
  if (members.length === 0) return [];

  // Hitung jumlah hewan per member.
  const ids = members.map((m) => m.id);
  const { data: pets } = await supabase
    .from("animals")
    .select("owner_id")
    .in("owner_id", ids);

  const petCount = (pets || []).reduce((acc, p) => {
    acc[p.owner_id] = (acc[p.owner_id] || 0) + 1;
    return acc;
  }, {});

  return members.map((m) => ({ ...m, petCount: petCount[m.id] || 0 }));
}

/** Aktif/nonaktifkan akun member. */
export async function setMemberActive(id, isActive) {
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw error;
  return true;
}

// =====================================================================
// LOYALTY POINTS (PRD 10.3 & 11.4)
// Poin masuk saat aktivitas (mis. kunjungan selesai). Tier dihitung
// dari total poin: Silver 0-499, Gold 500-1499, Platinum 1500+.
// =====================================================================

export const LOYALTY_TIERS = [
  { key: "silver",   label: "Silver",   min: 0,    discount: 0,  color: "#9E9E9E" },
  { key: "gold",     label: "Gold",     min: 500,  discount: 5,  color: "#F0A500" },
  { key: "platinum", label: "Platinum", min: 1500, discount: 10, color: "#7B1FA2" },
];

// Poin yang diberikan setiap satu kunjungan selesai (COMPLETED).
export const POINTS_PER_VISIT = 50;

/** Tentukan tier dari total poin. */
export function tierFromPoints(points) {
  let tier = LOYALTY_TIERS[0];
  for (const t of LOYALTY_TIERS) if (points >= t.min) tier = t;
  return tier;
}

/** Ambil ringkasan loyalty member: total poin, tier, riwayat. */
export async function getLoyalty(memberId) {
  const { data, error } = await supabase
    .from("loyalty_points")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows = data || [];
  // EARN menambah, REDEEM/EXPIRE mengurangi.
  const total = rows.reduce((sum, r) => {
    if (r.type === "EARN") return sum + (r.points || 0);
    return sum - (r.points || 0);
  }, 0);

  return {
    total: Math.max(0, total),
    tier: tierFromPoints(Math.max(0, total)),
    history: rows,
  };
}

/** Tambah poin (EARN). */
export async function addPoints(memberId, points, source, referenceId = null) {
  const { error } = await supabase.from("loyalty_points").insert({
    member_id: memberId,
    points,
    type: "EARN",
    source,
    reference_id: referenceId,
  });
  if (error) throw error;

  // Notifikasi poin masuk (PRD 7.9 & 7.8).
  try {
    await createNotification({
      userId: memberId,
      type: "loyalty",
      title: `+${points} poin loyalty`,
      body: source ? `Poin dari: ${source}` : "Poin loyalty bertambah.",
    });
  } catch (e) {
    console.error("Gagal membuat notifikasi poin:", e.message);
  }

  return true;
}

/** Tukar poin (REDEEM). */
export async function redeemPoints(memberId, points, source) {
  const { error } = await supabase.from("loyalty_points").insert({
    member_id: memberId,
    points,
    type: "REDEEM",
    source,
  });
  if (error) throw error;
  return true;
}

// =====================================================================
// REWARDS — katalog hadiah loyalty
// =====================================================================
export async function getRewards() {
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("is_active", true)
    .order("points_required", { ascending: true });
  if (error) throw error;
  return data || [];
}

/**
 * Tukar satu reward: validasi poin cukup, catat redemption, kurangi poin.
 * @returns {{ok:boolean, error?:string}}
 */
export async function redeemReward(memberId, reward) {
  const { total } = await getLoyalty(memberId);
  if (total < reward.points_required) {
    return { ok: false, error: "Poin kamu belum cukup untuk menukar hadiah ini." };
  }

  // Catat permintaan penukaran (diverifikasi admin).
  const { error: redErr } = await supabase.from("redemptions").insert({
    member_id: memberId,
    reward_id: reward.id,
    points_used: reward.points_required,
    status: "PENDING",
  });
  if (redErr) return { ok: false, error: redErr.message };

  // Kurangi poin member.
  await redeemPoints(memberId, reward.points_required, `Tukar: ${reward.name}`);
  return { ok: true };
}

// =====================================================================
// NOTIFICATIONS (PRD 7.9)
// Pusat notifikasi member: pengingat janji, vaksin, pembayaran, promo.
// =====================================================================

/** Ambil notifikasi milik user. */
export async function getNotifications(userId) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Buat satu notifikasi (dipakai sistem saat ada aktivitas). */
export async function createNotification({ userId, type = "info", title, body = null, data = null }) {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    data,
  });
  if (error) throw error;
  return true;
}

/** Tandai satu notifikasi sudah dibaca. */
export async function markNotificationRead(id) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);
  if (error) throw error;
  return true;
}

/** Tandai semua notifikasi user sudah dibaca. */
export async function markAllNotificationsRead(userId) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) throw error;
  return true;
}

// =====================================================================
// REKAM MEDIS per MEMBER (PRD 7.5)
// Ambil semua rekam medis untuk seluruh hewan milik member.
// =====================================================================
export async function getMedicalRecordsByOwner(ownerId) {
  // 1. Ambil hewan milik member.
  const { data: animals, error: aErr } = await supabase
    .from("animals")
    .select("id, name, species")
    .eq("owner_id", ownerId);
  if (aErr) throw aErr;

  const list = animals || [];
  if (list.length === 0) return [];

  const animalMap = Object.fromEntries(list.map((a) => [a.id, a]));
  const ids = list.map((a) => a.id);

  // 2. Ambil rekam medis + resep untuk hewan-hewan itu.
  const { data: records, error: rErr } = await supabase
    .from("medical_records")
    .select("*, prescriptions(*)")
    .in("animal_id", ids)
    .order("created_at", { ascending: false });
  if (rErr) throw rErr;

  // 3. Gabungkan info hewan.
  return (records || []).map((r) => ({
    ...r,
    animal: animalMap[r.animal_id] || null,
  }));
}

// =====================================================================
// KONSULTASI ONLINE (PRD 7.6)
// Member membuka thread konsultasi ke dokter, lalu chat.
// Tabel: consultations + consultation_messages.
// =====================================================================

/** Ambil daftar konsultasi milik member. */
export async function getConsultations(memberId) {
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Buat konsultasi baru (thread). */
export async function createConsultation({ memberId, doctorId = null, animalId = null, subject }) {
  const { data, error } = await supabase
    .from("consultations")
    .insert({
      member_id: memberId,
      doctor_id: doctorId,
      animal_id: animalId,
      subject: subject?.trim() || "Konsultasi",
      status: "OPEN",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Ambil pesan dalam satu konsultasi. */
export async function getConsultationMessages(consultationId) {
  const { data, error } = await supabase
    .from("consultation_messages")
    .select("*")
    .eq("consultation_id", consultationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

/** Kirim pesan ke konsultasi. */
export async function sendConsultationMessage({ consultationId, senderId, message }) {
  const { data, error } = await supabase
    .from("consultation_messages")
    .insert({
      consultation_id: consultationId,
      sender_id: senderId,
      message: message?.trim(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// =====================================================================
// INVOICES / PEMBAYARAN (PRD 7.7)
// Member melihat tagihan & membayar (status PENDING -> PAID).
// Saat PAID, beri poin loyalty (PRD 11.4) + notifikasi.
// =====================================================================

/** Ambil invoice milik member + itemnya. */
export async function getInvoicesByOwner(memberId) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Bayar invoice (PENDING -> PAID). */
export async function payInvoice(invoiceId, method = "QRIS") {
  const { data, error } = await supabase
    .from("invoices")
    .update({ status: "PAID", paid_at: new Date().toISOString(), payment_method: method })
    .eq("id", invoiceId)
    .select()
    .single();
  if (error) throw error;

  // Beri poin + notifikasi saat pembayaran lunas.
  try {
    if (data?.member_id) {
      const earned = Math.max(10, Math.floor((data.total || 0) / 10000)); // 1 poin / Rp10.000
      await addPoints(data.member_id, earned, "Pembayaran invoice", invoiceId);
      await createNotification({
        userId: data.member_id,
        type: "payment",
        title: "Pembayaran berhasil",
        body: `Invoice telah dibayar via ${method}.`,
      });
    }
  } catch (e) {
    console.error("Gagal proses pasca-pembayaran:", e.message);
  }

  return data;
}

// =====================================================================
// DOKTER — Dashboard, Pasien, Konsultasi, Laporan, Profil (PRD 8)
// Catatan: aplikasi ini satu klinik; dokter melihat data klinik secara
// menyeluruh (konsisten dengan halaman Jadwal yang sudah ada).
// =====================================================================

/** KPI ringkas dashboard dokter (PRD 8.1). */
export async function getDoctorStats() {
  const [apptR, recR] = await Promise.all([
    supabase.from("appointments").select("id, status, scheduled_at, animal_id"),
    supabase.from("medical_records").select("id, created_at"),
  ]);
  if (apptR.error) throw apptR.error;
  const appts = apptR.data || [];
  const recs = recR.data || [];

  const today = new Date();
  const isToday = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();
  };

  const byStatus = appts.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return {
    todayCount: appts.filter((a) => isToday(a.scheduled_at)).length,
    pending: byStatus.PENDING || 0,
    confirmed: byStatus.CONFIRMED || 0,
    completed: byStatus.COMPLETED || 0,
    totalAppointments: appts.length,
    uniquePatients: new Set(appts.map((a) => a.animal_id).filter(Boolean)).size,
    totalRecords: recs.length,
    appointments: appts,
  };
}

/** Daftar pasien (hewan) + pemilik untuk dokter (PRD 8.3). */
export async function getAllPatients() {
  const { data: animals, error } = await supabase
    .from("animals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const list = animals || [];
  if (list.length === 0) return [];

  const ownerIds = [...new Set(list.map((a) => a.owner_id).filter(Boolean))];
  let ownerMap = {};
  if (ownerIds.length > 0) {
    const { data: owners } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, city")
      .in("id", ownerIds);
    ownerMap = Object.fromEntries((owners || []).map((o) => [o.id, o]));
  }

  // Jumlah kunjungan per hewan.
  const { data: appts } = await supabase
    .from("appointments")
    .select("animal_id");
  const visitCount = (appts || []).reduce((acc, a) => {
    if (a.animal_id) acc[a.animal_id] = (acc[a.animal_id] || 0) + 1;
    return acc;
  }, {});

  return list.map((a) => ({
    ...a,
    owner: ownerMap[a.owner_id] || null,
    visitCount: visitCount[a.id] || 0,
  }));
}

/** Semua konsultasi (untuk inbox dokter, PRD 8.5). */
export async function getAllConsultations() {
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const list = data || [];
  if (list.length === 0) return [];

  const memberIds = [...new Set(list.map((c) => c.member_id).filter(Boolean))];
  let memberMap = {};
  if (memberIds.length > 0) {
    const { data: members } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", memberIds);
    memberMap = Object.fromEntries((members || []).map((m) => [m.id, m]));
  }

  return list.map((c) => ({ ...c, member: memberMap[c.member_id] || null }));
}

/** Tutup / buka konsultasi (PRD 8.5). */
export async function setConsultationStatus(id, status) {
  const { error } = await supabase
    .from("consultations")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
  return true;
}

/** Laporan & statistik dokter (PRD 8.6). */
export async function getDoctorReport() {
  const [apptR, recR] = await Promise.all([
    supabase.from("appointments").select("status, scheduled_at, complaint, created_at"),
    supabase.from("medical_records").select("created_at, diagnosis"),
  ]);
  if (apptR.error) throw apptR.error;
  const appts = apptR.data || [];
  const recs = recR.data || [];

  // Tren 6 bulan terakhir (jumlah kunjungan per bulan).
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("id-ID", { month: "short" }),
      count: 0,
    });
  }
  const monthIndex = Object.fromEntries(months.map((m, i) => [m.key, i]));
  appts.forEach((a) => {
    const iso = a.scheduled_at || a.created_at;
    if (!iso) return;
    const d = new Date(iso);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (key in monthIndex) months[monthIndex[key]].count += 1;
  });

  // Distribusi status.
  const byStatus = appts.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  // Diagnosis terbanyak.
  const diagCount = {};
  recs.forEach((r) => {
    const key = (r.diagnosis || "Lainnya").trim();
    diagCount[key] = (diagCount[key] || 0) + 1;
  });
  const topDiagnoses = Object.entries(diagCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    monthly: months,
    byStatus,
    topDiagnoses,
    totalAppointments: appts.length,
    totalRecords: recs.length,
  };
}

/** Ambil profil dokter (profiles + doctors) untuk halaman profil (PRD 8.7). */
export async function getDoctorProfile(id) {
  const [{ data: prof }, { data: doc }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("doctors").select("*").eq("id", id).maybeSingle(),
  ]);
  return { ...(prof || {}), ...(doc || {}) };
}

/** Simpan profil dokter (profiles + doctors). */
export async function updateDoctorProfile(id, { full_name, phone, city, avatar_url, specialization, str_number, bio }) {
  const { error: pErr } = await supabase
    .from("profiles")
    .update({ full_name, phone, city, avatar_url })
    .eq("id", id);
  if (pErr) throw pErr;

  const { error: dErr } = await supabase
    .from("doctors")
    .update({ specialization, str_number, bio })
    .eq("id", id);
  if (dErr) throw dErr;
  return true;
}

// =====================================================================
// ADMIN — Appointment, Layanan & Harga, CRM Analytics (PRD 9)
// =====================================================================

// ---------- 9.4 APPOINTMENT (admin lihat semua) ----------
/** Semua appointment + nama member untuk admin. */
export async function getAdminAppointments() {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("scheduled_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// ---------- 9.5 LAYANAN & HARGA (CRUD services) ----------
export async function getServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("category", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createService(svc) {
  const { data, error } = await supabase
    .from("services")
    .insert({
      name: svc.name?.trim(),
      category: svc.category?.trim() || null,
      description: svc.description?.trim() || null,
      base_price: svc.base_price ? Number(svc.base_price) : 0,
      duration_minutes: svc.duration_minutes ? Number(svc.duration_minutes) : 30,
      is_active: svc.is_active ?? true,
    })
    .select()
    .single();
  if (error) throw error;
  logAudit({ action: "Tambah layanan", tableName: "services", recordId: data.id, newValues: { name: data.name } });
  return data;
}

export async function updateService(id, updates) {
  const payload = {};
  if ("name" in updates) payload.name = updates.name?.trim();
  if ("category" in updates) payload.category = updates.category?.trim() || null;
  if ("description" in updates) payload.description = updates.description?.trim() || null;
  if ("base_price" in updates) payload.base_price = Number(updates.base_price) || 0;
  if ("duration_minutes" in updates) payload.duration_minutes = Number(updates.duration_minutes) || 30;
  if ("is_active" in updates) payload.is_active = updates.is_active;

  const { error } = await supabase.from("services").update(payload).eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteService(id) {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
  logAudit({ action: "Hapus layanan", tableName: "services", recordId: id });
  return true;
}

// ---------- 9.6 CRM ANALYTICS & LAPORAN ----------
/**
 * Analitik CRM: CLV, segmentasi RFM sederhana, retensi, akuisisi,
 * pendapatan, dan ringkasan. Dihitung dari invoices + appointments + profiles.
 */
export async function getCrmAnalytics() {
  const [profR, apptR, invR] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role, created_at"),
    supabase.from("appointments").select("member_id, status, scheduled_at, created_at"),
    supabase.from("invoices").select("member_id, total, status, paid_at, created_at"),
  ]);
  if (profR.error) throw profR.error;

  const profiles = (profR.data || []).filter((p) => p.role === "customer" || p.role === "member");
  const appts = apptR.data || [];
  const invoices = (invR.data || []).filter((i) => i.status === "PAID");

  const now = new Date();
  const memberName = Object.fromEntries(profiles.map((p) => [p.id, p.full_name || "Member"]));

  // --- Pendapatan total + per bulan (6 bln) ---
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("id-ID", { month: "short" }), revenue: 0 });
  }
  const mIdx = Object.fromEntries(months.map((m, i) => [m.key, i]));
  let totalRevenue = 0;
  const spendByMember = {};
  const lastVisitByMember = {};
  const freqByMember = {};

  invoices.forEach((inv) => {
    const amt = inv.total || 0;
    totalRevenue += amt;
    spendByMember[inv.member_id] = (spendByMember[inv.member_id] || 0) + amt;
    const iso = inv.paid_at || inv.created_at;
    if (iso) {
      const d = new Date(iso);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (k in mIdx) months[mIdx[k]].revenue += amt;
    }
  });

  appts.forEach((a) => {
    if (!a.member_id) return;
    freqByMember[a.member_id] = (freqByMember[a.member_id] || 0) + 1;
    const iso = a.scheduled_at || a.created_at;
    if (iso) {
      const prev = lastVisitByMember[a.member_id];
      if (!prev || new Date(iso) > new Date(prev)) lastVisitByMember[a.member_id] = iso;
    }
  });

  // --- CLV: rata-rata pengeluaran per member ---
  const payingMembers = Object.keys(spendByMember).length || 1;
  const avgClv = totalRevenue / payingMembers;

  // --- Top member by CLV ---
  const topMembers = Object.entries(spendByMember)
    .map(([id, total]) => ({ id, name: memberName[id] || "Member", total, visits: freqByMember[id] || 0 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // --- Segmentasi RFM sederhana: berdasar recency & frequency ---
  const DAY = 86400000;
  let champions = 0, loyal = 0, atRisk = 0, newcomers = 0, dormant = 0;
  profiles.forEach((p) => {
    const last = lastVisitByMember[p.id];
    const freq = freqByMember[p.id] || 0;
    const recencyDays = last ? Math.floor((now - new Date(last)) / DAY) : Infinity;
    const joinDays = p.created_at ? Math.floor((now - new Date(p.created_at)) / DAY) : 0;

    if (freq === 0) {
      if (joinDays <= 30) newcomers += 1;
      else dormant += 1;
    } else if (recencyDays <= 30 && freq >= 3) champions += 1;
    else if (recencyDays <= 90) loyal += 1;
    else atRisk += 1;
  });

  const segments = [
    { key: "champions", label: "Champions", value: champions, color: "#14b8a6" },
    { key: "loyal", label: "Loyal", value: loyal, color: "#0ea5e9" },
    { key: "newcomers", label: "Baru", value: newcomers, color: "#a78bfa" },
    { key: "atRisk", label: "Berisiko", value: atRisk, color: "#f59e0b" },
    { key: "dormant", label: "Pasif", value: dormant, color: "#94a3b8" },
  ];

  // --- Retensi: member dengan >1 kunjungan / total member ---
  const repeatMembers = Object.values(freqByMember).filter((f) => f > 1).length;
  const retentionRate = profiles.length ? Math.round((repeatMembers / profiles.length) * 100) : 0;

  // --- Akuisisi: member baru per bulan (6 bln) ---
  const acqMonths = months.map((m) => ({ label: m.label, count: 0 }));
  profiles.forEach((p) => {
    if (!p.created_at) return;
    const d = new Date(p.created_at);
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    if (k in mIdx) acqMonths[mIdx[k]].count += 1;
  });

  return {
    totalRevenue,
    avgClv,
    totalMembers: profiles.length,
    retentionRate,
    repeatMembers,
    monthly: months,
    acquisition: acqMonths,
    segments,
    topMembers,
  };
}

// =====================================================================
// ADMIN — Loyalty Management (PRD 9.7 & 10.3)
// Rewards CRUD + approval penukaran (redemptions).
// =====================================================================

/** Semua reward (termasuk nonaktif) untuk admin. */
export async function getAllRewards() {
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .order("points_required", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createReward(r) {
  const { data, error } = await supabase
    .from("rewards")
    .insert({
      name: r.name?.trim(),
      description: r.description?.trim() || null,
      points_required: Number(r.points_required) || 0,
      stock: Number(r.stock) || 0,
      is_active: r.is_active ?? true,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateReward(id, updates) {
  const payload = {};
  if ("name" in updates) payload.name = updates.name?.trim();
  if ("description" in updates) payload.description = updates.description?.trim() || null;
  if ("points_required" in updates) payload.points_required = Number(updates.points_required) || 0;
  if ("stock" in updates) payload.stock = Number(updates.stock) || 0;
  if ("is_active" in updates) payload.is_active = updates.is_active;
  const { error } = await supabase.from("rewards").update(payload).eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteReward(id) {
  const { error } = await supabase.from("rewards").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/** Daftar penukaran (redemptions) + nama member & reward. */
export async function getRedemptions() {
  const { data, error } = await supabase
    .from("redemptions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const list = data || [];
  if (list.length === 0) return [];

  const memberIds = [...new Set(list.map((r) => r.member_id).filter(Boolean))];
  const rewardIds = [...new Set(list.map((r) => r.reward_id).filter(Boolean))];

  const [{ data: members }, { data: rewards }] = await Promise.all([
    memberIds.length ? supabase.from("profiles").select("id, full_name").in("id", memberIds) : Promise.resolve({ data: [] }),
    rewardIds.length ? supabase.from("rewards").select("id, name").in("id", rewardIds) : Promise.resolve({ data: [] }),
  ]);
  const mMap = Object.fromEntries((members || []).map((m) => [m.id, m.full_name]));
  const rMap = Object.fromEntries((rewards || []).map((r) => [r.id, r.name]));

  return list.map((r) => ({
    ...r,
    member_name: mMap[r.member_id] || "Member",
    reward_name: rMap[r.reward_id] || "Reward",
  }));
}

/** Setujui / tolak penukaran. Jika ditolak, poin dikembalikan. */
export async function setRedemptionStatus(redemption, status) {
  const { error } = await supabase
    .from("redemptions")
    .update({ status })
    .eq("id", redemption.id);
  if (error) throw error;

  // Tolak -> kembalikan poin (EARN balik) + notifikasi.
  try {
    if (status === "REJECTED" && redemption.member_id) {
      await addPoints(redemption.member_id, redemption.points_used || 0, "Pengembalian penukaran ditolak");
    }
    if (redemption.member_id) {
      await createNotification({
        userId: redemption.member_id,
        type: "loyalty",
        title: status === "APPROVED" ? "Penukaran disetujui" : "Penukaran ditolak",
        body: status === "APPROVED"
          ? `Penukaran "${redemption.reward_name || "reward"}" disetujui. Silakan klaim di klinik.`
          : `Penukaran "${redemption.reward_name || "reward"}" ditolak. Poin dikembalikan.`,
      });
    }
  } catch (e) {
    console.error("Gagal proses pasca-redemption:", e.message);
  }
  return true;
}

// =====================================================================
// ADMIN — Kampanye / CRM Automation (PRD 9.8)
// campaigns CRUD + vouchers CRUD.
// =====================================================================
export async function getCampaigns() {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("sent_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data || [];
}

export async function createCampaign(c) {
  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      name: c.name?.trim(),
      target_segment: c.target_segment || null,
      message_template: c.message_template?.trim() || null,
      total_recipients: Number(c.total_recipients) || 0,
      sent_at: c.sent ? new Date().toISOString() : null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Tandai campaign terkirim (simulasi blast) ke sejumlah penerima. */
export async function sendCampaign(id, recipients) {
  const { error } = await supabase
    .from("campaigns")
    .update({ sent_at: new Date().toISOString(), total_recipients: recipients })
    .eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteCampaign(id) {
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function getVouchers() {
  const { data, error } = await supabase
    .from("vouchers")
    .select("*")
    .order("expires_at", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data || [];
}

export async function createVoucher(v) {
  const { data, error } = await supabase
    .from("vouchers")
    .insert({
      code: v.code?.trim().toUpperCase(),
      discount_type: v.discount_type || "percent",
      discount_value: Number(v.discount_value) || 0,
      min_purchase: Number(v.min_purchase) || 0,
      max_use: Number(v.max_use) || 0,
      expires_at: v.expires_at || null,
      is_active: v.is_active ?? true,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteVoucher(id) {
  const { error } = await supabase.from("vouchers").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// =====================================================================
// CRM INTI — Customer Lifecycle (10.1) & RFM Segmentation (10.2)
// Menghitung skor R/F/M per member + tahap lifecycle.
// =====================================================================
export async function getRfmSegmentation() {
  const [profR, apptR, invR] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, role, created_at"),
    supabase.from("appointments").select("member_id, scheduled_at, created_at, status"),
    supabase.from("invoices").select("member_id, total, status, paid_at, created_at"),
  ]);
  if (profR.error) throw profR.error;

  const members = (profR.data || []).filter((p) => p.role === "customer" || p.role === "member");
  const appts = apptR.data || [];
  const invoices = (invR.data || []).filter((i) => i.status === "PAID");

  const now = new Date();
  const DAY = 86400000;

  const recencyDays = {};
  const frequency = {};
  const monetary = {};

  appts.forEach((a) => {
    if (!a.member_id) return;
    frequency[a.member_id] = (frequency[a.member_id] || 0) + 1;
    const iso = a.scheduled_at || a.created_at;
    if (iso) {
      const days = Math.floor((now - new Date(iso)) / DAY);
      if (recencyDays[a.member_id] == null || days < recencyDays[a.member_id]) {
        recencyDays[a.member_id] = days;
      }
    }
  });
  invoices.forEach((i) => {
    if (!i.member_id) return;
    monetary[i.member_id] = (monetary[i.member_id] || 0) + (i.total || 0);
  });

  // Skor 1-3 sederhana.
  const scoreR = (days) => (days == null ? 1 : days <= 30 ? 3 : days <= 90 ? 2 : 1);
  const scoreF = (f) => (f >= 5 ? 3 : f >= 2 ? 2 : 1);
  const scoreM = (m) => (m >= 1_000_000 ? 3 : m >= 300_000 ? 2 : 1);

  const lifecycleOf = (r, f, days) => {
    if (f === 0) return days == null ? "Prospect" : "New Member";
    if (r === 3 && f === 3) return "Loyal (VIP)";
    if (r >= 2) return "Active";
    if (r === 1 && days != null && days > 180) return "Churned";
    return "At-Risk";
  };

  const rows = members.map((p) => {
    const days = recencyDays[p.id];
    const f = frequency[p.id] || 0;
    const m = monetary[p.id] || 0;
    const R = scoreR(days), F = scoreF(f), M = scoreM(m);
    return {
      id: p.id,
      name: p.full_name || "Member",
      email: p.email || "",
      recencyDays: days == null ? null : days,
      frequency: f,
      monetary: m,
      R, F, M,
      rfm: `${R}${F}${M}`,
      lifecycle: lifecycleOf(R, f, days),
    };
  });

  // Ringkasan segmen RFM.
  const segLabel = (r) => {
    if (r.R === 3 && r.F === 3 && r.M === 3) return "Champions";
    if (r.R >= 2 && r.F >= 2) return "Loyal Customers";
    if (r.R === 1 && r.F >= 2) return "At-Risk";
    if (r.frequency === 0) return "Prospect";
    if (r.R === 1) return "Lost Customers";
    return "Potential";
  };
  rows.forEach((r) => { r.segment = segLabel(r); });

  const segmentSummary = {};
  rows.forEach((r) => { segmentSummary[r.segment] = (segmentSummary[r.segment] || 0) + 1; });

  const lifecycleSummary = {};
  rows.forEach((r) => { lifecycleSummary[r.lifecycle] = (lifecycleSummary[r.lifecycle] || 0) + 1; });

  return { rows, segmentSummary, lifecycleSummary };
}

// =====================================================================
// REVIEWS & RATING + NPS (PRD 10.5 Customer Feedback)
// =====================================================================

/** Daftar dokter beserta agregat rating dari tabel reviews. */
export async function getDoctorsWithReviews() {
  const docs = await getDoctors(); // sudah ada: doctors + profile
  const { data: reviews } = await supabase
    .from("reviews")
    .select("doctor_id, rating, comment, created_at, member_id, is_approved")
    .order("created_at", { ascending: false });

  const all = reviews || [];
  // Nama member untuk ditampilkan.
  const memberIds = [...new Set(all.map((r) => r.member_id).filter(Boolean))];
  let nameMap = {};
  if (memberIds.length) {
    const { data: members } = await supabase
      .from("profiles").select("id, full_name").in("id", memberIds);
    nameMap = Object.fromEntries((members || []).map((m) => [m.id, m.full_name]));
  }

  return docs.map((d) => {
    const list = all
      .filter((r) => r.doctor_id === d.id)
      .map((r) => ({ ...r, member_name: nameMap[r.member_id] || "Member" }));
    const count = list.length;
    const avg = count ? list.reduce((s, r) => s + (r.rating || 0), 0) / count : 0;
    const recommend = count ? Math.round((list.filter((r) => r.rating >= 4).length / count) * 100) : 0;
    return {
      id: d.id,
      name: d.profile?.full_name || "Dokter",
      specialization: d.specialization || "Dokter Hewan",
      avgRating: Number(avg.toFixed(1)),
      totalReviews: count,
      recommend,
      reviews: list,
    };
  });
}

/** Kirim review untuk dokter (PRD 7.4.9 / 10.5). */
export async function submitReview({ memberId, doctorId, appointmentId = null, rating, comment }) {
  const { error } = await supabase.from("reviews").insert({
    member_id: memberId,
    doctor_id: doctorId,
    appointment_id: appointmentId,
    rating: Number(rating),
    comment: comment?.trim() || null,
    is_approved: true,
  });
  if (error) throw error;

  // Alert admin untuk review negatif (<=2) lewat notifikasi (PRD 10.5).
  try {
    if (Number(rating) <= 2) {
      await createNotification({
        userId: memberId, // tercatat untuk member; admin baca via panel
        type: "info",
        title: "Terima kasih atas masukan Anda",
        body: "Tim kami akan menindaklanjuti ulasan Anda secepatnya.",
      });
    }
  } catch (e) {
    console.error("Notif review gagal:", e.message);
  }
  return true;
}

/** Semua review untuk panel admin (termasuk yang perlu ditindaklanjuti). */
export async function getAllReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const list = data || [];
  if (list.length === 0) return [];
  const memberIds = [...new Set(list.map((r) => r.member_id).filter(Boolean))];
  let nameMap = {};
  if (memberIds.length) {
    const { data: members } = await supabase
      .from("profiles").select("id, full_name").in("id", memberIds);
    nameMap = Object.fromEntries((members || []).map((m) => [m.id, m.full_name]));
  }
  return list.map((r) => ({ ...r, member_name: nameMap[r.member_id] || "Member" }));
}

/** Simpan skor NPS (0-10) ke tabel leads (type 'nps'). */
export async function submitNps({ score, comment, email = "anonim@vetcare.id" }) {
  const { error } = await supabase.from("leads").insert({
    type: "nps",
    email,
    message: `NPS:${score}${comment ? ` | ${comment}` : ""}`,
  });
  if (error) throw error;
  return true;
}

// =====================================================================
// AUTOMATED CRM TRIGGERS (PRD 10.4)
// Karena app tanpa backend cron/email, trigger dijalankan client-side:
// memeriksa kondisi lalu membuat NOTIFIKASI in-app untuk member.
// Dipanggil mis. saat member membuka dashboard.
// =====================================================================

/**
 * Jalankan trigger otomatis untuk satu member (idempoten per hari via
 * penanda di tabel notifications dengan judul unik).
 * - Win-back: tidak ada kunjungan > 90 hari -> ajakan kembali.
 * - Reminder kontrol: ada follow_up_date <= 7 hari lagi.
 */
export async function runMemberTriggers(memberId) {
  if (!memberId) return;
  try {
    const today = new Date();
    const inDays = (iso) => Math.ceil((new Date(iso) - today) / 86400000);

    // Notifikasi yang sudah ada (cegah duplikat).
    const { data: existing } = await supabase
      .from("notifications")
      .select("title, created_at")
      .eq("user_id", memberId);
    const has = (title) =>
      (existing || []).some(
        (n) => n.title === title &&
          new Date(n.created_at).toDateString() === today.toDateString()
      );

    // 1) Reminder kontrol dari rekam medis (follow_up_date dekat).
    const records = await getMedicalRecordsByOwner(memberId);
    for (const r of records) {
      if (r.follow_up_date) {
        const d = inDays(r.follow_up_date);
        if (d >= 0 && d <= 7) {
          const title = "Pengingat jadwal kontrol";
          if (!has(title)) {
            await createNotification({
              userId: memberId, type: "appointment", title,
              body: `Jadwal kontrol ${r.animal?.name || "hewan"} Anda ${d === 0 ? "hari ini" : `dalam ${d} hari`}.`,
            });
          }
        }
      }
    }

    // 2) Win-back: appointment terakhir > 90 hari lalu.
    const { data: appts } = await supabase
      .from("appointments")
      .select("scheduled_at")
      .eq("member_id", memberId)
      .order("scheduled_at", { ascending: false })
      .limit(1);
    if (appts && appts.length) {
      const last = appts[0].scheduled_at;
      if (last && -inDays(last) > 90) {
        const title = "Kami merindukan hewan Anda";
        if (!has(title)) {
          await createNotification({
            userId: memberId, type: "promo", title,
            body: "Sudah lama tidak berkunjung. Yuk jadwalkan pemeriksaan rutin, ada promo menanti!",
          });
        }
      }
    }
  } catch (e) {
    console.error("runMemberTriggers gagal:", e.message);
  }
}

// =====================================================================
// AUDIT LOGS (PRD 12 — tabel audit_logs)
// Mencatat aksi penting (mis. ubah status, CRUD layanan/reward).
// =====================================================================
export async function logAudit({ actorId = null, action, tableName = null, recordId = null, oldValues = null, newValues = null }) {
  try {
    await supabase.from("audit_logs").insert({
      actor_id: typeof actorId === "string" && actorId.startsWith("local-") ? null : actorId,
      action,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues,
    });
  } catch (e) {
    console.error("logAudit gagal:", e.message);
  }
}

/** Ambil riwayat audit terbaru (untuk admin). */
export async function getAuditLogs(limit = 100) {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  const list = data || [];
  const actorIds = [...new Set(list.map((l) => l.actor_id).filter(Boolean))];
  let nameMap = {};
  if (actorIds.length) {
    const { data: actors } = await supabase
      .from("profiles").select("id, full_name").in("id", actorIds);
    nameMap = Object.fromEntries((actors || []).map((a) => [a.id, a.full_name]));
  }
  return list.map((l) => ({ ...l, actor_name: nameMap[l.actor_id] || "Sistem/Admin" }));
}
