// src/context/CustomerDataContext.jsx
// =====================================================================
// Store data customer (hewan + jadwal) berbasis localStorage.
// Seluruh halaman customer (dashboard, daftar hewan, detail, booking)
// membaca/menulis dari satu sumber ini, sehingga selalu sinkron.
// Nanti bisa diganti Supabase tanpa mengubah komponen — cukup ubah
// implementasi fungsi di provider ini.
// =====================================================================
import { createContext, useContext, useEffect, useState } from "react";
import { dummyPets, dummyAppointments } from "../data/dummyCustomer";

const KEY_PETS = "vetcare_pets_v1";
const KEY_APPTS = "vetcare_appts_v1";

const seedPets = () =>
  dummyPets.map((p) => ({
    complaint: "",
    status: "Diterima",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...p,
  }));

const seedAppts = () =>
  dummyAppointments.map((a) => {
    const pet = dummyPets.find((p) => p.name === a.petName);
    return { petId: pet?.id ?? null, ...a };
  });

function load(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return seed();
}

const genId = (prefix) =>
  `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e4)}`;

const CustomerDataContext = createContext(null);

export const useCustomerData = () => {
  const ctx = useContext(CustomerDataContext);
  if (!ctx)
    throw new Error("useCustomerData harus dipakai di dalam CustomerDataProvider");
  return ctx;
};

export function CustomerDataProvider({ children }) {
  const [pets, setPets] = useState(() => load(KEY_PETS, seedPets));
  const [appointments, setAppointments] = useState(() => load(KEY_APPTS, seedAppts));

  useEffect(() => {
    localStorage.setItem(KEY_PETS, JSON.stringify(pets));
  }, [pets]);
  useEffect(() => {
    localStorage.setItem(KEY_APPTS, JSON.stringify(appointments));
  }, [appointments]);

  // ---------------- PETS ----------------
  const addPet = (data) => {
    const pet = {
      id: genId("p"),
      name: data.name?.trim() || "Tanpa Nama",
      species: data.species || "Kucing",
      breed: data.breed?.trim() || "-",
      ageText: data.ageText?.trim() || "-",
      weightKg: data.weightKg ? Number(data.weightKg) : null,
      photo: data.photo?.trim() || "",
      vaccineStatus: data.vaccineStatus || "belum",
      healthStatus: data.healthStatus || "healthy",
      complaint: data.complaint?.trim() || "",
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    setPets((prev) => [pet, ...prev]);
    return pet;
  };

  const updatePet = (id, updates) =>
    setPets((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

  const removePet = (id) => {
    setPets((prev) => prev.filter((p) => p.id !== id));
    setAppointments((prev) => prev.filter((a) => a.petId !== id));
  };

  const getPet = (id) => pets.find((p) => p.id === id) ?? null;

  // ------------- APPOINTMENTS -------------
  const addAppointment = (data) => {
    const appt = {
      id: genId("a"),
      petId: data.petId ?? null,
      petName: data.petName || "",
      doctorName: data.doctorName || "",
      dateTime: data.dateTime,
      reason: data.reason?.trim() || "Pemeriksaan",
      status: "upcoming",
    };
    setAppointments((prev) => [...prev, appt]);
    return appt;
  };

  const cancelAppointment = (id) =>
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
    );

  const value = {
    pets,
    appointments,
    addPet,
    updatePet,
    removePet,
    getPet,
    addAppointment,
    cancelAppointment,
  };

  return (
    <CustomerDataContext.Provider value={value}>
      {children}
    </CustomerDataContext.Provider>
  );
}
