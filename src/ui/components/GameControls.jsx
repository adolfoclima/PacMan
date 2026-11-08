import styled from "@emotion/styled";

const DIRECTIONS = [
  ["up", "▲", "W"],
  ["left", "◀", "A"],
  ["down", "▼", "S"],
  ["right", "▶", "D"],
];

export function GameControls({ i18n, onMove, onStart }) {
  const moveLabel = (direction) =>
    i18n.t(`move${direction[0].toUpperCase()}${direction.slice(1)}`);

  return (
    <>
      <MobileControls aria-label={i18n.t("mobileControls")}>
        {DIRECTIONS.map(([direction, symbol]) => (
          <button
            key={direction}
            type="button"
            data-dir={direction}
            aria-label={moveLabel(direction)}
            onPointerDown={(event) => {
              event.preventDefault();
              onMove(direction);
            }}
          >
            {symbol}
          </button>
        ))}
      </MobileControls>
      <DesktopControls aria-label={i18n.t("gameControls")}>
        <ControlsLabel>{i18n.t("controls")}</ControlsLabel>
        {DIRECTIONS.map(([direction, symbol, key]) => (
          <button
            key={direction}
            type="button"
            data-dir={direction}
            aria-label={moveLabel(direction)}
            onPointerDown={() => onMove(direction)}
          >
            <span>{key}</span>
            <small>{symbol}</small>
          </button>
        ))}
        <button
          type="button"
          data-action="enter"
          aria-label={i18n.t("confirm")}
          onPointerDown={onStart}
        >
          <span>{i18n.t("confirm")}</span>
          <small>▶|</small>
        </button>
      </DesktopControls>
    </>
  );
}

const MobileControls = styled.div`
  display: none;
  grid-template-columns: repeat(3, 54px);
  grid-template-rows: repeat(2, 54px);
  gap: 6px;
  margin-top: 14px;
  button {
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.07);
    color: #fff;
    cursor: pointer;
    touch-action: none;
  }
  button[data-dir="up"] {
    grid-column: 2;
  }
  button[data-dir="left"] {
    grid-column: 1;
    grid-row: 2;
  }
  button[data-dir="down"] {
    grid-column: 2;
    grid-row: 2;
  }
  button[data-dir="right"] {
    grid-column: 3;
    grid-row: 2;
  }
  @media (max-width: 768px) {
    display: grid;
  }
`;
const DesktopControls = styled.footer`
  width: min(760px, 100%);
  min-height: 88px;
  margin-top: 18px;
  border-top: 1px solid rgba(125, 129, 159, 0.18);
  display: grid;
  grid-template-columns: 110px repeat(4, 58px) minmax(118px, 150px);
  align-items: end;
  justify-content: center;
  gap: 8px;
  padding-top: 14px;
  button {
    height: 58px;
    width: 58px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-bottom-width: 4px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.07);
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    cursor: pointer;
    touch-action: none;
    padding: 0;
  }
  button span {
    font-size: 14px;
    color: #ffe438;
  }
  button small {
    font-size: 16px;
    line-height: 1;
  }
  button[data-action="enter"] {
    width: 100%;
    min-width: 118px;
    max-width: 150px;
    min-height: 58px;
    height: auto;
    padding: 7px 10px;
  }
  button[data-action="enter"] span {
    width: 100%;
    font-size: clamp(10px, 0.75vw, 12px);
    line-height: 1.25;
    overflow-wrap: normal;
    word-break: normal;
    white-space: normal;
  }
  button:hover,
  button.active {
    background: rgba(255, 228, 56, 0.14);
    border-color: rgba(255, 228, 56, 0.55);
  }
  @media (max-width: 768px) {
    display: none;
  }
`;
const ControlsLabel = styled.span`
  align-self: center;
  color: #7d819f;
  font-size: 10px;
  letter-spacing: 2px;
`;
