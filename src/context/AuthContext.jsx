import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(undefined);

// =====================================================================
// AKUN LOKAL (TIDAK PAKAI DATABASE)
// Hanya customer yang menggunakan Supabase (register/login).
// Admin & Dokter tidak bisa register, jadi akunnya di-hardcode di sini.
// =====================================================================
const LOCAL_ACCOUNTS = [
  {
    email: "admin@gmail.com",
    password: "admin123",
    role: "admin",
    full_name: "Administrator",
  },
  {
    email: "dokter@gmail.com",
    password: "dokter123",
    role: "doctor",
    full_name: "Dokter",
  },
];

const LOCAL_SESSION_KEY = "vetcare_local_session";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
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

  // Loading awal HANYA true bila benar-benar ada sesi yang perlu dipulihkan
  // (sesi lokal admin/dokter ATAU token Supabase customer). Jika tidak ada,
  // langsung tampilkan UI tanpa menunggu jaringan sama sekali.
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
      // maybeSingle: tidak melempar 406 jika baris profil belum ada.
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

    // Safety: apapun yang terjadi, jangan biarkan layar "Memuat..." lebih
    // dari 1,5 detik (mis. proxy gagal / Supabase tidak bisa dijangkau).
    const safetyTimer = setTimeout(finish, 1500);

    const initializeAuth = async () => {
      try {
        // 1. Cek sesi lokal (admin / dokter) lebih dulu — instan, tanpa jaringan.
        const localRaw = localStorage.getItem(LOCAL_SESSION_KEY);
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          setUser(parsed.user);
          setProfile(parsed.profile);
          finish();
          return;
        }

        // 2. Cek sesi Supabase (customer), tapi jangan biarkan menggantung.
        //    Race melawan timeout supaya tidak nyangkut saat jaringan buruk.
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 1200)
          ),
        ]);

        const session = sessionResult?.data?.session;

        if (session?.user) {
          setUser(session.user);
          // Profil di-fetch di latar belakang, tidak menahan UI.
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
      // Jika ada sesi lokal admin/dokter aktif, abaikan event Supabase
      // supaya tidak menimpa state.
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

      // 2. Selain itu, login customer via Supabase.
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const profileData = await fetchProfile(data.user.id);

      if (!profileData) {
        return {
          success: false,
          error: "Profil user tidak ditemukan",
        };
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

      // Catat waktu login terakhir (tidak memblokir alur jika gagal).
      supabase
        .from("profiles")
        .update({ last_login: new Date().toISOString() })
        .eq("id", data.user.id)
        .then(({ error: updErr }) => {
          if (updErr) console.error("Update last_login error:", updErr);
        });

      return {
        success: true,
        role: profileData.role,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
      };
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
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Profil otomatis dibuat oleh trigger `handle_new_user` di database.
      // Jika ada session aktif (email confirmation nonaktif), lengkapi
      // data profil via upsert sebagai fallback.
      if (data.session && data.user) {
        await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            email,
            full_name: fullName,
            phone,
            role: "customer",
            is_active: true,
          },
          { onConflict: "id" }
        );
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.message,
      };
    }
  };

  // ==========================
  // LOGOUT
  // ==========================

  const logout = async () => {
    try {
      // Hapus sesi lokal (admin/dokter) bila ada.
      localStorage.removeItem(LOCAL_SESSION_KEY);

      // Hapus sesi Supabase (customer) bila ada.
      await supabase.auth.signOut();

      setUser(null);
      setProfile(null);

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  };

  // ==========================
  // UPDATE PROFILE (customer)
  // ==========================

  const updateProfile = async (updates) => {
    if (!user) {
      return {
        success: false,
        error: "User tidak login",
      };
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
        return {
          success: false,
          error: error.message,
        };
      }

      await fetchProfile(user.id);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.message,
      };
    }
  };

  const getUserProfile = async () => {
    if (!user) return;
    if (localStorage.getItem(LOCAL_SESSION_KEY)) return;
    await fetchProfile(user.id);
  };

  const value = {
    user,
    profile,

    role: profile?.role || null,

    loading,

    isAuthenticated: !!user,

    login,

    register,

    logout,

    updateProfile,

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

  return {
    role,

    isAdmin: role === "admin",

    isDoctor: role === "doctor",

    isCustomer: role === "customer",

    hasRole: (requiredRole) => role === requiredRole,

    hasAnyRole: (roles) => roles.includes(role),
  };
};
