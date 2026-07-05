// src/context/CustomerDataContext.jsx
// =====================================================================
// Store data customer (hewan + jadwal) berbasis SUPABASE.
// Data terikat ke akun yang login (owner_id = auth user id).
// Interface dipertahankan agar komponen lama tidak perlu banyak diubah:
//   pets, appointments, loading,
//   addPet, updatePet, removePet, getPet,
//   addAppointment, cancelAppointment, refresh
//
// Mapping field UI (camelCase) <-> kolom Supabase (snake_case) ditangani
// lewat helper mapPet / mapAppt di bawah.
// =====================================================================
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { createNotification } from "../lib/services";

const CustomerDataContext = createContext(null);

export const useCustomerData = () => {
  const ctx = useContext(CustomerDataContext);
  if (!ctx)
    throw new Error("useCustomerData harus dipakai di dalam CustomerDataProvider");
  return ctx;
};

// ---- Mapper: row Supabase -> objek UI ----
const mapPet = (row) => ({
  id: row.id,
  name: row.name ?? "",
  species: row.species ?? "Kucing",
  breed: row.breed ?? "",
  ageText: row.age_text ?? "",
  weightKg: row.weight ?? null,
  gender: row.gender ?? "",
  color: row.color ?? "",
  microchip: row.microchip ?? "",
  mainVet: row.main_vet ?? "",
  photo: row.foto ?? row.photo_url ?? row.photo ?? "",
  vaccineStatus: row.vaccine_status ?? "belum",
  healthStatus: row.health_status ?? "healthy",
  complaint: row.notes ?? "",
  createdAt: row.created_at,
});

const isMissingColumnError = (error, column) => {
  const text = `${error?.code || ""} ${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return text.includes(column.toLowerCase()) && (
    text.includes("column") ||
    text.includes("schema cache") ||
    text.includes("pgrst204")
  );
};

const withPhotoUrlColumn = (payload) => {
  const next = { ...payload };
  if ("foto" in next) {
    next.photo_url = next.foto;
    delete next.foto;
  }
  return next;
};

const mapAppt = (row) => ({
  id: row.id,
  petId: row.animal_id,
  petName: row.pet_name ?? "",
  doctorName: row.doctor_name ?? "",
  dateTime: row.scheduled_at,
  reason: row.complaint ?? "Pemeriksaan",
  rawStatus: row.status, // PENDING | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW
  // UI lama pakai "upcoming"/"cancelled"; map dari status DB.
  status:
    row.status === "CANCELLED"
      ? "cancelled"
      : row.status === "COMPLETED"
      ? "done"
      : "upcoming",
});

export function CustomerDataProvider({ children }) {
  const { user } = useAuth();
  const ownerId = user?.id ?? null;

  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------- LOAD ----------
  const refresh = useCallback(async () => {
    if (!ownerId) {
      setPets([]);
      setAppointments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [petsRes, apptRes] = await Promise.all([
        supabase
          .from("animals")
          .select("*")
          .eq("owner_id", ownerId)
          .order("created_at", { ascending: false }),
        supabase
          .from("appointments")
          .select("*")
          .eq("member_id", ownerId)
          .order("scheduled_at", { ascending: true }),
      ]);

      if (petsRes.error) throw petsRes.error;
      if (apptRes.error) throw apptRes.error;

      setPets((petsRes.data || []).map(mapPet));
      setAppointments((apptRes.data || []).map(mapAppt));
    } catch (err) {
      console.error("Gagal memuat data customer:", err.message);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ---------- PETS ----------
  const addPet = async (data) => {
    if (!ownerId) return null;
    const gender = data.gender?.trim();
    const foto = data.photo?.trim();

    if (!gender) {
      throw new Error("Kelamin hewan wajib dipilih.");
    }
    if (!foto) {
      throw new Error("URL foto hewan wajib diisi.");
    }

    const payload = {
      owner_id: ownerId,
      name: data.name?.trim() || "Tanpa Nama",
      species: data.species || "Kucing",
      breed: data.breed?.trim() || null,
      age_text: data.ageText?.trim() || null,
      weight: data.weightKg ? Number(data.weightKg) : null,
      gender,
      color: data.color || null,
      microchip: data.microchip || null,
      main_vet: data.mainVet || null,
      foto,
      vaccine_status: data.vaccineStatus || "belum",
      health_status: data.healthStatus || "healthy",
      notes: data.complaint?.trim() || null,
    };
    let { data: row, error } = await supabase
      .from("animals")
      .insert(payload)
      .select()
      .single();

    if (error && isMissingColumnError(error, "foto")) {
      const retry = await supabase
        .from("animals")
        .insert(withPhotoUrlColumn(payload))
        .select()
        .single();
      row = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("Gagal tambah hewan:", error.message);
      throw error;
    }

    if (row?.id && (row.gender !== gender || row.foto !== foto)) {
      const { data: syncedRow, error: syncError } = await supabase
        .from("animals")
        .update({ gender, foto })
        .eq("id", row.id)
        .eq("owner_id", ownerId)
        .select()
        .single();

      if (syncError) {
        console.error("Gagal sinkron gender/foto hewan:", syncError.message);
        throw syncError;
      }

      row = syncedRow || row;
    }

    const pet = mapPet(row);
    setPets((prev) => [pet, ...prev]);
    return pet;
  };

  const updatePet = async (id, updates) => {
    const payload = {};
    if ("name" in updates) payload.name = updates.name;
    if ("species" in updates) payload.species = updates.species;
    if ("breed" in updates) payload.breed = updates.breed;
    if ("ageText" in updates) payload.age_text = updates.ageText;
    if ("weightKg" in updates) payload.weight = updates.weightKg ? Number(updates.weightKg) : null;
    if ("gender" in updates) payload.gender = updates.gender || null;
    if ("color" in updates) payload.color = updates.color || null;
    if ("microchip" in updates) payload.microchip = updates.microchip || null;
    if ("mainVet" in updates) payload.main_vet = updates.mainVet || null;
    if ("photo" in updates) payload.foto = updates.photo?.trim() || null;
    if ("vaccineStatus" in updates) payload.vaccine_status = updates.vaccineStatus;
    if ("healthStatus" in updates) payload.health_status = updates.healthStatus;
    if ("complaint" in updates) payload.notes = updates.complaint;

    let { error } = await supabase.from("animals").update(payload).eq("id", id);
    if (error && isMissingColumnError(error, "foto")) {
      const retry = await supabase.from("animals").update(withPhotoUrlColumn(payload)).eq("id", id);
      error = retry.error;
    }
    if (error) {
      console.error("Gagal update hewan:", error.message);
      throw error;
    }
    setPets((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const removePet = async (id) => {
    const { error } = await supabase.from("animals").delete().eq("id", id);
    if (error) {
      console.error("Gagal hapus hewan:", error.message);
      return;
    }
    setPets((prev) => prev.filter((p) => p.id !== id));
    setAppointments((prev) => prev.filter((a) => a.petId !== id));
  };

  const getPet = (id) => pets.find((p) => p.id === id) ?? null;

  // ---------- APPOINTMENTS ----------
  const addAppointment = async (data) => {
    if (!ownerId) return null;
    const payload = {
      member_id: ownerId,
      animal_id: data.petId ?? null,
      pet_name: data.petName || "",
      doctor_name: data.doctorName || "",
      scheduled_at: data.dateTime,
      complaint: data.reason?.trim() || "Pemeriksaan",
      status: "PENDING",
    };
    const { data: row, error } = await supabase
      .from("appointments")
      .insert(payload)
      .select()
      .single();
    if (error) {
      console.error("Gagal buat jadwal:", error.message);
      return null;
    }
    const appt = mapAppt(row);
    setAppointments((prev) =>
      [...prev, appt].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    );

    // Notifikasi: konfirmasi pengajuan janji temu (PRD 7.9).
    try {
      await createNotification({
        userId: ownerId,
        type: "appointment",
        title: "Janji temu diajukan",
        body: `Permintaan janji untuk ${payload.pet_name || "hewan"} sedang menunggu konfirmasi dokter.`,
      });
    } catch (e) {
      console.error("Gagal membuat notifikasi:", e.message);
    }

    return appt;
  };

  const cancelAppointment = async (id) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "CANCELLED" })
      .eq("id", id);
    if (error) {
      console.error("Gagal batalkan jadwal:", error.message);
      return;
    }
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
    );
  };

  const value = {
    pets,
    appointments,
    loading,
    addPet,
    updatePet,
    removePet,
    getPet,
    addAppointment,
    cancelAppointment,
    refresh,
  };

  return (
    <CustomerDataContext.Provider value={value}>
      {children}
    </CustomerDataContext.Provider>
  );
}
