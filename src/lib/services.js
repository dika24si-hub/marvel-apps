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
