import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import GameContextProvider from "./state/GameContextProvider.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <GameContextProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GameContextProvider>
);
