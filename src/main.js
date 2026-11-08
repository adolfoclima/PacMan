import "./style.css";
import { PacManGame } from "./game/PacManGame.js";
import { I18n } from "./i18n/I18n.js";

const i18n = new I18n();
const game = new PacManGame(i18n);

window.addEventListener("pagehide", () => game.destroy(), { once: true });
