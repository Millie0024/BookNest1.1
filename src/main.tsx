import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; // Adjusted path to App.tsx

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
