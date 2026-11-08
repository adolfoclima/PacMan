import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { PacManGame } from "../game/PacManGame.js";
import { GlobalStyles } from "./GlobalStyles.jsx";
import { Topbar } from "./components/Topbar.jsx";
import { GameHud } from "./components/GameHud.jsx";
import { GameBoard } from "./components/GameBoard.jsx";
import { GameControls } from "./components/GameControls.jsx";

const INITIAL_OVERLAY = {
  titleKey: "ready",
  textKey: "instruction",
  textVariables: {},
  buttonKey: "start",
};

export function GameApp({ i18n }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [locale, setLocale] = useState(i18n.locale);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1 });
  const [overlay, setOverlay] = useState(INITIAL_OVERLAY);

  useEffect(() => {
    const unsubscribe = i18n.subscribe(setLocale);
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context)
      throw new Error("2D canvas context is unavailable");

    gameRef.current = new PacManGame(canvas, context, {
      updateHud: (score, lives, level) => setHud({ score, lives, level }),
      showOverlay: (titleKey, textKey, textVariables, buttonKey) =>
        setOverlay({ titleKey, textKey, textVariables, buttonKey }),
      hideOverlay: () => setOverlay(null),
      setSoundEnabled: setSoundEnabled,
    });

    return () => {
      unsubscribe();
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, [i18n]);

  useEffect(() => {
    const ensureAudioContext = () => {
      gameRef.current?.audioService.ensureContext();
    };
    window.addEventListener("pointerdown", ensureAudioContext, { once: true });
    return () => window.removeEventListener("pointerdown", ensureAudioContext);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      const keyMap = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
        a: "left",
        d: "right",
        w: "up",
        s: "down",
      };
      const direction = keyMap[event.key] || keyMap[event.key.toLowerCase()];
      if (direction && overlay) {
        event.preventDefault();
        return;
      }
      if (direction) {
        event.preventDefault();
        gameRef.current?.setDirection(direction);
        gameRef.current?.audioService.ensureContext();
      } else if (event.key === "Enter" && !event.repeat && overlay) {
        event.preventDefault();
        gameRef.current?.start();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [overlay]);

  const move = (direction) => {
    if (!overlay) gameRef.current?.setDirection(direction);
  };

  const start = () => gameRef.current?.start();
  const toggleSound = () => gameRef.current?.toggleSound();

  return (
    <>
      <GlobalStyles />
      <GameShell>
        <Topbar
          i18n={i18n}
          locale={locale}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
        <GameArea>
          <GameHud i18n={i18n} hud={hud}>
            <GameBoard
              canvasRef={canvasRef}
              i18n={i18n}
              overlay={overlay}
              onStart={start}
            />
          </GameHud>
        </GameArea>
        <GameControls i18n={i18n} onMove={move} onStart={start} />
      </GameShell>
    </>
  );
}

const GameShell = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 28px 30px;
  @media (max-width: 768px) {
    padding: 10px 10px 20px;
  }
`;
const GameArea = styled.section`
  width: min(760px, 100%);
  @media (max-width: 768px) {
    width: 100%;
    max-width: 504px;
  }
`;
