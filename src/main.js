import "./style.css";
import { PacManGame } from "./game/PacManGame.js";

const game = new PacManGame();

window.addEventListener("pagehide", () => game.destroy(), { once: true });
