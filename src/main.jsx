import { createRoot } from "react-dom/client";
import { GameApp } from "./ui/GameApp.jsx";
import { I18n } from "./i18n/I18n.js";

const i18n = new I18n();

createRoot(document.querySelector("#app")).render(<GameApp i18n={i18n} />);
