import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(undefined);

// =====================================================================
// AKUN ADMIN LOKAL
// Admin TIDAK bisa register dari UI. Akun admin disediakan di sini
// (atau dibuat manual di Supabase lalu set role='admin').
// Dokter TIDAK ada di sini — akun dokter dibuat oleh admin & tersimpan
// di Supabase (login dokter lewat Supabase Auth).
// Member register sendiri lewat Supabase.
// =====================================================================
const LOCAL_ACCOUNTS = [
  {
    email: "admin@gmail.com",
    password: "admin123",
    role: "admin",
    full_name: "Administrator",
  },
];

const LOCAL_SESSION_KEY = "vetcare_local_session";

const normalizeAppRole = (role) => {
  const value = String(role || "").trim().toLowerCase();
  if (["member", "user", "client", "pemilik"].includes(value)) return "customer";
  return value || null;
};

const ensureProfileRow = async ({ id, email, fullName = "", phone = "", role = "customer" }) => {
  if (!id) return;
  try {
    const { error } = await supabase.from("profiles").upsert(
      {
        id,
        email,
        full_name: fullName,
        phone,
        role,
        is_active: true,
      },
      { onConflict: "id" }
    );

    if (error) console.warn("Sinkron profil user gagal:", error.message);
  } catch (err) {
    console.warn("Sinkron profil user gagal:", err.message);
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

// Cek apakah ada token sesi Supabase tersimpan di localStorage.
// Token Supabase memakai key berformat: sb-<ref>-auth-token
const hasSupabaseToken = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Loading awal HANYA true bila benar-benar ada sesi yang perlu dipulihkan.
  const [loading, setLoading] = useState(() => {
    try {
      return (
        !!localStorage.getItem(LOCAL_SESSION_KEY) || hasSupabaseToken()
      );
    } catch {
      return false;
    }
  });

  // ==========================
  // GET PROFILE (Supabase - customer)
  // ==========================
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Fetch Profile Error:", error);
        setProfile(null);
        return null;
      }

      setProfile(data);
      return data;
    } catch (err) {
      console.error(err);
      setProfile(null);
      return null;
    }
  };

  // ==========================
  // INIT AUTH
  // ==========================
  useEffect(() => {
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      setLoading(false);
    };

    const safetyTimer = setTimeout(finish, 1500);

    const initializeAuth = async () => {
      try {
        // 1. Cek sesi lokal (admin / dokter) lebih dulu — instan.
        const localRaw = localStorage.getItem(LOCAL_SESSION_KEY);
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          setUser(parsed.user);
          setProfile(parsed.profile);
          finish();
          return;
        }

        // 2. Cek sesi Supabase (customer), race melawan timeout.
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 1200)
          ),
        ]);

        const session = sessionResult?.data?.session;

        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        clearTimeout(safetyTimer);
        finish();
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Jika ada sesi lokal admin/dokter aktif, abaikan event Supabase.
      if (localStorage.getItem(LOCAL_SESSION_KEY)) return;

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ==========================
  // LOGIN
  // ==========================
  const login = async (email, password) => {
    try {
      // 1. Cek akun lokal (admin / dokter) lebih dulu.
      const local = LOCAL_ACCOUNTS.find(
        (a) => a.email === email && a.password === password
      );

      if (local) {
        const localUser = {
          id: `local-${local.role}`,
          email: local.email,
        };
        const localProfile = {
          id: localUser.id,
          email: local.email,
          full_name: local.full_name,
          phone: "",
          role: local.role,
        };

        localStorage.setItem(
          LOCAL_SESSION_KEY,
          JSON.stringify({ user: localUser, profile: localProfile })
        );

        setUser(localUser);
        setProfile(localProfile);

        return { success: true, role: local.role };
      }

      // 2. Login customer via Supabase.
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      let profileData = await fetchProfile(data.user.id);

      if (!profileData) {
        await ensureProfileRow({
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.user_metadata?.full_name || "",
          phone: data.user.user_metadata?.phone || "",
          role: normalizeAppRole(data.user.user_metadata?.role) || "customer",
        });
        profileData = await fetchProfile(data.user.id);

        if (!profileData) {
          return {
            success: false,
            error: "Profil user tidak ditemukan",
          };
        }
      }

      // Akun nonaktif tidak boleh login.
      if (profileData.is_active === false) {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        return {
          success: false,
          error: "Akun Anda dinonaktifkan. Hubungi admin.",
        };
      }

      // Catat waktu login terakhir (tidak memblokir alur).
      supabase
        .from("profiles")
        .update({ last_login: new Date().toISOString() })
        .eq("id", data.user.id)
        .then(({ error: updErr }) => {
          if (updErr) console.error("Update last_login error:", updErr);
        });

      return { success: true, role: profileData.role };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ==========================
  // REGISTER CUSTOMER (Supabase)
  // ==========================
  const register = async (email, password, fullName, phone) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role: "customer",
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      await ensureProfileRow({
        id: data.user?.id,
        email,
        fullName,
        phone,
        role: "customer",
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ==========================
  // CREATE DOCTOR (khusus ADMIN)
  // Admin membuat akun dokter. Memakai client Supabase TERPISAH supaya
  // proses signUp tidak menimpa sesi admin yang sedang aktif.
  // Role 'doctor' + baris tabel doctors dibuat otomatis oleh trigger
  // handle_new_user (membaca metadata role).
  // ==========================
  const createDoctor = async ({
    email,
    password,
    fullName,
    phone = "",
    specialization = "",
    strNumber = "",
    bio = "",
  }) => {
    // Hanya admin yang boleh.
    if (profile?.role !== "admin") {
      return { success: false, error: "Hanya admin yang dapat membuat akun dokter." };
    }

    try {
      // Client sementara: storage tidak persist → tidak mengubah sesi admin.
      const { createClient } = await import("@supabase/supabase-js");
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { data, error } = await tempClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role: "doctor",
            specialization,
            str_number: strNumber,
            bio,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, userId: data.user?.id };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ==========================
  // LOGOUT (kembali ke halaman guest)
  // ==========================
  const logout = async () => {
    try {
      // Hapus sesi lokal (admin/dokter) bila ada.
      localStorage.removeItem(LOCAL_SESSION_KEY);

      // Hapus sesi Supabase (customer) bila ada.
      await supabase.auth.signOut();

      setUser(null);
      setProfile(null);

      // Kembali ke halaman guest setelah logout.
      window.location.href = "/";
      return { success: true };
    } catch (err) {
      console.error(err);
      window.location.href = "/";
      return { success: false };
    }
  };

  // ==========================
  // UPDATE PROFILE (customer)
  // ==========================
  const updateProfile = async (updates) => {
    if (!user) {
      return { success: false, error: "User tidak login" };
    }

    // Akun lokal tidak tersimpan di database.
    if (localStorage.getItem(LOCAL_SESSION_KEY)) {
      const next = { ...profile, ...updates };
      setProfile(next);
      localStorage.setItem(
        LOCAL_SESSION_KEY,
        JSON.stringify({ user, profile: next })
      );
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      await fetchProfile(user.id);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const getUserProfile = async () => {
    if (!user) return;
    if (localStorage.getItem(LOCAL_SESSION_KEY)) return;
    await fetchProfile(user.id);
  };

  // ==========================
  // GANTI PASSWORD (customer Supabase)
  // ==========================
  const changePassword = async (newPassword) => {
    // Akun lokal (admin) tidak tersimpan di Supabase Auth.
    if (localStorage.getItem(LOCAL_SESSION_KEY)) {
      return { success: false, error: "Akun ini tidak mendukung ganti password." };
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    profile,
    role: normalizeAppRole(profile?.role),
    loading,
    isAuthenticated: !!user,
    login,
    register,
    createDoctor,
    logout,
    updateProfile,
    changePassword,
    getUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useRole = () => {
  const { role } = useAuth();
  const normalizedRole = normalizeAppRole(role);

  return {
    role: normalizedRole,
    isAdmin: normalizedRole === "admin",
    isDoctor: normalizedRole === "doctor",
    isCustomer: normalizedRole === "customer",
    hasRole: (requiredRole) => normalizedRole === normalizeAppRole(requiredRole),
    hasAnyRole: (roles) => roles.map(normalizeAppRole).includes(normalizedRole),
  };
};
