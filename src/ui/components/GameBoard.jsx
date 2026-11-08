import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";

export function GameBoard({ canvasRef, i18n, overlay, onStart }) {
  return (
    <BoardWrap>
      <Canvas
        ref={canvasRef}
        width="504"
        height="504"
        aria-label="Tabuleiro Pac-Man"
        role="img"
      >
        {i18n.t("canvasFallback")}
      </Canvas>
      <Overlay
        hidden={overlay === null}
        role="dialog"
        aria-modal="true"
        aria-hidden={overlay === null}
      >
        <OverlayPanel>
          <MiniPac aria-hidden="true" />
          <h1>{i18n.t(overlay?.titleKey ?? "ready")}</h1>
          <p>
            {i18n.t(overlay?.textKey ?? "instruction", overlay?.textVariables)}
          </p>
          <button type="button" onClick={onStart}>
            {i18n.t(overlay?.buttonKey ?? "start")}
          </button>
        </OverlayPanel>
      </Overlay>
    </BoardWrap>
  );
}

const BoardWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #080a13;
  border-radius: 8px;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.45),
    inset 0 0 0 1px rgba(83, 105, 255, 0.12);
  @media (max-width: 768px) {
    grid-column: 1/-1;
    grid-row: 2;
    width: min(504px, 100%);
    justify-self: center;
  }
`;
const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 8px;
`;
const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(5, 6, 15, 0.72);
  backdrop-filter: blur(2px);
  border-radius: 8px;
  transition: 0.25s;
  ${({ hidden }) =>
    hidden && "opacity:0;pointer-events:none;visibility:hidden;"}
`;
const OverlayPanel = styled.div`
  text-align: center;
  h1 {
    margin: 12px 0 8px;
    color: #ffe438;
    font-family: "Press Start 2P";
    font-size: 22px;
    text-shadow: 3px 3px 0 #9e3d00;
  }
  p {
    color: #aaaec8;
    font-size: 12px;
    margin: 0 0 18px;
  }
  button {
    border: 0;
    border-radius: 999px;
    background: #ffe438;
    color: #161600;
    padding: 12px 28px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 5px 0 #a77700;
  }
  button:active {
    transform: translateY(3px);
    box-shadow: 0 2px 0 #a77700;
  }
`;
const chomp = keyframes`
  50% { background: conic-gradient(#ffe438 0 280deg, transparent 280deg); }
`;
const MiniPac = styled.div`
  width: 38px;
  height: 38px;
  margin: auto;
  border-radius: 50%;
  background: conic-gradient(#ffe438 0 310deg, transparent 310deg);
  animation: ${chomp} 0.45s linear infinite;
`;
