import { useLang } from "../../i18n/LanguageContext";

export default function Forgot() {
  const { t } = useLang();

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2 text-center">
        {t("forgot.title")}
      </h2>

      <p className="text-sm text-gray-500 mb-6 text-center">
        {t("forgot.subtitle")}
      </p>

      <form>
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("forgot.email")}
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400"
            placeholder={t("forgot.emailPh")}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          {t("forgot.submit")}
        </button>
      </form>
    </div>
  );
}
