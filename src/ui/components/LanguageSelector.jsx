import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";

const FLAG_SVGS = {
  "pt-BR": (
    <svg viewBox="0 0 30 20" role="presentation">
      <rect width="30" height="20" rx="2" fill="#009b3a" />
      <path d="M15 2.5 27 10 15 17.5 3 10Z" fill="#ffdf00" />
      <circle cx="15" cy="10" r="5" fill="#002776" />
    </svg>
  ),
  "en-US": (
    <svg viewBox="0 0 30 20" role="presentation">
      <rect width="30" height="20" rx="2" fill="#fff" />
      <path
        d="M0 2h30M0 6h30M0 10h30M0 14h30M0 18h30"
        stroke="#b22234"
        strokeWidth="2"
      />
      <rect width="12" height="11" rx="1" fill="#3c3b6e" />
    </svg>
  ),
  "es-ES": (
    <svg viewBox="0 0 30 20" role="presentation">
      <rect width="30" height="20" rx="2" fill="#aa151b" />
      <rect y="5" width="30" height="10" fill="#f1bf00" />
    </svg>
  ),
};

const LANGUAGES = [
  { locale: "pt-BR", name: "Português" },
  { locale: "en-US", name: "English" },
  { locale: "es-ES", name: "Español" },
];

export function LanguageSelector({ i18n, locale }) {
  const [open, setOpen] = useState(false);
  const controlRef = useRef(null);

  useEffect(() => {
    const closeOutside = (event) => {
      if (!controlRef.current?.contains(event.target)) setOpen(false);
    };
    const closeEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, []);

  const selectLanguage = (nextLocale) => {
    i18n.setLocale(nextLocale);
    setOpen(false);
  };

  return (
    <Control ref={controlRef}>
      <Button
        type="button"
        aria-label={i18n.t("language")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Flag>{FLAG_SVGS[locale]}</Flag>
        <Chevron open={open} />
      </Button>
      {open && (
        <Menu role="menu">
          {LANGUAGES.map((language) => {
            const selected = language.locale === locale;
            return (
              <Option
                key={language.locale}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                selected={selected}
                onClick={() => selectLanguage(language.locale)}
              >
                <Flag>{FLAG_SVGS[language.locale]}</Flag>
                <span>{language.name}</span>
                <Check selected={selected}>✓</Check>
              </Option>
            );
          })}
        </Menu>
      )}
    </Control>
  );
}

const Control = styled.div`
  position: relative;
`;
const Button = styled.button`
  height: 42px;
  min-width: 70px;
  border: 1px solid rgba(255, 228, 56, 0.24);
  border-radius: 14px;
  padding: 0 11px;
  color: #fff;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.11),
    rgba(255, 255, 255, 0.04)
  );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 8px 20px rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
  transition: 0.18s;
  &:hover,
  &[aria-expanded="true"] {
    border-color: rgba(255, 228, 56, 0.58);
    background: linear-gradient(
      145deg,
      rgba(255, 228, 56, 0.16),
      rgba(255, 255, 255, 0.06)
    );
  }
  &:active {
    transform: scale(0.97);
  }
`;
const Flag = styled.span`
  width: 25px;
  height: 18px;
  display: grid;
  place-items: center;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35));
  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;
const Chevron = styled.span`
  width: 6px;
  height: 6px;
  border-right: 1.5px solid #9ea3c3;
  border-bottom: 1.5px solid #9ea3c3;
  transform: ${({ open }) =>
    open ? "translateY(2px) rotate(225deg)" : "translateY(-2px) rotate(45deg)"};
  transition: 0.18s;
`;
const Menu = styled.div`
  position: absolute;
  z-index: 20;
  top: calc(100% + 8px);
  right: 0;
  width: 190px;
  padding: 6px;
  border: 1px solid rgba(255, 228, 56, 0.18);
  border-radius: 16px;
  background: rgba(16, 18, 38, 0.96);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.48);
`;
const Option = styled.button`
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 11px;
  padding: 0 8px;
  color: ${({ selected }) => (selected ? "#ffe438" : "#d8daea")};
  background: ${({ selected }) =>
    selected ? "rgba(255,228,56,.08)" : "transparent"};
  display: grid;
  grid-template-columns: 34px 1fr 18px;
  align-items: center;
  text-align: left;
  font-size: 12px;
  cursor: pointer;
  &:hover,
  &:focus-visible {
    color: #fff;
    background: rgba(255, 255, 255, 0.07);
    outline: none;
  }
  svg {
    width: 28px;
    height: 19px;
    display: block;
  }
`;
const Check = styled.span`
  opacity: ${({ selected }) => (selected ? 1 : 0)};
  text-align: center;
`;
