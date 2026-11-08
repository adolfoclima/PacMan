import styled from "@emotion/styled";
import { LanguageSelector } from "./LanguageSelector.jsx";

export function Topbar({ i18n, locale, soundEnabled, onToggleSound }) {
  return (
    <Header>
      <Brand>
        <BrandDot />
        PAC-MAN
      </Brand>
      <Actions>
        <LanguageSelector i18n={i18n} locale={locale} />
        <SoundButton
          type="button"
          muted={!soundEnabled}
          aria-label={i18n.t("soundToggle")}
          aria-pressed={soundEnabled}
          title={soundEnabled ? i18n.t("disableSound") : i18n.t("enableSound")}
          onClick={onToggleSound}
        >
          {soundEnabled ? "♪" : "×"}
        </SoundButton>
      </Actions>
    </Header>
  );
}

const Header = styled.header`
  width: min(760px, 100%);
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media (max-width: 768px) {
    height: 48px;
    width: 504px;
    max-width: 100%;
    margin-bottom: 18px;
  }
`;
const Brand = styled.div`
  color: #ffe438;
  font-family: "Press Start 2P", monospace;
  font-size: 19px;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 3px 3px 0 #7b3d00;
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;
const BrandDot = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: conic-gradient(#ffe438 0 310deg, transparent 310deg);
`;
const Actions = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const SoundButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: ${({ muted }) => (muted ? "#8b8fa8" : "#fff")};
  background: ${({ muted }) =>
    muted ? "rgba(255,255,255,.025)" : "rgba(255,255,255,.06)"};
  cursor: pointer;
  font-size: 20px;
`;
