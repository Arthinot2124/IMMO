import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ElementAccueilSombre } from "./screens/ElementAccueilSombre";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <ElementAccueilSombre />
  </StrictMode>,
);
