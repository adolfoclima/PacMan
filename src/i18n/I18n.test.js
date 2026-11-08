import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_LOCALE,
  I18n,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LOCALES,
} from "./I18n.js";

describe("I18n", () => {
  beforeEach(() => {
    const storage = new Map();
    vi.stubGlobal("localStorage", {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    });
    vi.stubGlobal("navigator", { languages: ["pt-BR"] });
    vi.stubGlobal("document", {
      documentElement: { lang: "", dir: "" },
      title: "",
    });
  });

  it("detects and normalizes a matching browser locale", () => {
    navigator.languages = ["en-GB", "es-MX"];
    const i18n = new I18n();
    expect(i18n.locale).toBe("en-US");
  });

  it("falls back to the default locale", () => {
    navigator.languages = ["fr-FR"];
    const i18n = new I18n();
    expect(i18n.locale).toBe(DEFAULT_LOCALE);
  });

  it("uses a valid saved preference before browser languages", () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "es-ES");
    navigator.languages = ["en-US"];
    const i18n = new I18n();
    expect(i18n.locale).toBe("es-ES");
  });

  it("persists and broadcasts locale changes", () => {
    const i18n = new I18n();
    const listener = vi.fn();
    i18n.subscribe(listener);
    i18n.setLocale("en-US");
    expect(i18n.locale).toBe("en-US");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en-US");
    expect(listener).toHaveBeenCalledWith("en-US");
    expect(document.documentElement.lang).toBe("en-US");
  });

  it("interpolates values and pluralizes life labels", () => {
    const i18n = new I18n();
    expect(i18n.t("phase", { level: 4 })).toBe("FASE 4");
    expect(i18n.t("livesCount", { count: 1 })).toBe("1 vida");
    expect(i18n.t("livesCount", { count: 0 })).toBe("0 vidas");
    expect(i18n.t("nextPhase")).toBe("JOGAR PRÓXIMA FASE");
    i18n.setLocale("en-US");
    expect(i18n.t("livesCount", { count: 1 })).toBe("1 life");
    expect(SUPPORTED_LOCALES).toEqual(["pt-BR", "en-US", "es-ES"]);
  });
});
