import { BrowserRouter } from "react-router-dom";

import AppRouter from "./router/AppRouter";

import { LanguageProvider } from "./i18n/LanguageContext";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <SearchProvider>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </SearchProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}