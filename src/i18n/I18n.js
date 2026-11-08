import { translations } from "./translations.js";

export const SUPPORTED_LOCALES = ["pt-BR", "en-US", "es-ES"];
export const DEFAULT_LOCALE = "pt-BR";
export const LANGUAGE_STORAGE_KEY = "pacman-language";

export class I18n {
  constructor() {
    this.listeners = new Set();
    this.locale = this.resolveLocale();
    this.applyDocumentLocale();
  }

  resolveLocale() {
    let savedLocale = null;
    try {
      savedLocale = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch {
      savedLocale = null;
    }
    if (SUPPORTED_LOCALES.includes(savedLocale)) return savedLocale;

    const candidates = navigator.languages?.length
      ? navigator.languages
      : [navigator.language];
    for (const candidate of candidates) {
      if (!candidate) continue;
      const normalized = candidate.toLowerCase();
      const baseLanguage = normalized.split("-")[0];
      const locale = SUPPORTED_LOCALES.find(
        (supported) =>
          supported.toLowerCase() === normalized ||
          supported.split("-")[0].toLowerCase() === baseLanguage,
      );
      if (locale) return locale;
    }
    return DEFAULT_LOCALE;
  }

  setLocale(locale) {
    const nextLocale = SUPPORTED_LOCALES.includes(locale)
      ? locale
      : DEFAULT_LOCALE;
    if (this.locale === nextLocale) return;
    this.locale = nextLocale;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale);
    } catch {
      // Keep in-memory locale when storage is unavailable.
    }
    this.applyDocumentLocale();
    this.listeners.forEach((listener) => listener(this.locale));
  }

  applyDocumentLocale() {
    document.documentElement.lang = this.locale;
    document.documentElement.dir = "ltr";
    document.title = translations[this.locale]?.pageTitle ?? "Pac-Man";
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  t(key, variables = {}) {
    let selectedKey = key;
    if (Object.hasOwn(variables, "count")) {
      const count = Number(variables.count);
      const pluralRules = new Intl.PluralRules(this.locale);
      const pluralKey = `${key}_${count === 0 ? "zero" : pluralRules.select(count)}`;
      if (translations[this.locale]?.[pluralKey]) selectedKey = pluralKey;
      else {
        const fallbackPluralKey = `${key}_${pluralRules.select(count)}`;
        if (translations[this.locale]?.[fallbackPluralKey])
          selectedKey = fallbackPluralKey;
      }
    }

    let message =
      translations[this.locale]?.[selectedKey] ??
      translations[DEFAULT_LOCALE]?.[selectedKey] ??
      key;
    for (const [name, value] of Object.entries(variables)) {
      message = message.replaceAll(`{${name}}`, String(value));
    }
    return message;
  }
}
