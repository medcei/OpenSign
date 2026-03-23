import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json"
    },

    // Define português como idioma principal
    lng: "pt",

    // Fallback caso algo não esteja traduzido
    fallbackLng: "en",

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"]
    },

    ns: ["translation"],
    defaultNS: "translation",

    debug: false,

    interpolation: {
      escapeValue: false
    },

    // Adiciona português à lista de idiomas suportados
    supportedLngs: ["pt", "en", "es", "fr", "it", "de", "hi", "kr"]
  });

export default i18n;
