import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AutomationDashboard } from "./screens/AutomationDashboard";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <AutomationDashboard />
  </StrictMode>,
);