// src/main.tsx   (or src/index.tsx)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
// import FloatingAIChat from "./components/AiChat";   // ← This is your AI Assistant

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Your entire app */}
    <App />

    {/* Luna appears on EVERY page — bottom-right floating button */}
    {/* <FloatingAIChat /> */}
  </StrictMode>
);