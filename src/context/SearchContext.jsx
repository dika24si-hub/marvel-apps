import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Global search context.
 *
 * - Navbar render input search berdasarkan `keyword`, `placeholder`, dan `enabled`.
 * - Tiap halaman list memanggil `usePageSearch(placeholder)` untuk:
 *     1) set placeholder navbar saat halaman aktif
 *     2) ambil keyword global dan reset saat unmount
 *
 * Dengan begini search field di toolbar halaman bisa dihapus.
 */
const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [keyword, setKeyword] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [enabled, setEnabled] = useState(false);

  const value = useMemo(
    () => ({
      keyword,
      setKeyword,
      placeholder,
      setPlaceholder,
      enabled,
      setEnabled,
      reset: () => setKeyword(""),
    }),
    [keyword, placeholder, enabled]
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within <SearchProvider>");
  return ctx;
}

/**
 * Helper untuk halaman list.
 * - Aktifkan search & set placeholder saat halaman mount
 * - Reset keyword & disable saat unmount (atau saat pindah halaman)
 */
export function usePageSearch(placeholder) {
  const { keyword, setKeyword, setPlaceholder, setEnabled } = useSearch();

  useEffect(() => {
    setEnabled(true);
    setPlaceholder(placeholder);
    return () => {
      setEnabled(false);
      setPlaceholder("");
      setKeyword("");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholder]);

  // expose lowercased keyword for convenience
  const q = useMemo(() => keyword.trim().toLowerCase(), [keyword]);
  const matches = useCallback(
    (...fields) =>
      fields.some((f) => String(f ?? "").toLowerCase().includes(q)),
    [q]
  );

  return { keyword, q, matches };
}
