import AppRouter from "./router/AppRouter";
import { LanguageProvider } from "./i18n/LanguageContext";
import { SearchProvider } from "./context/SearchContext";

export default function App() {
  return (
    <LanguageProvider>
      <SearchProvider>
        <AppRouter />
      </SearchProvider>
    </LanguageProvider>
  );
}
