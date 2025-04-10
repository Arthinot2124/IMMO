import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ElementAccueilSombre } from "./screens/ElementAccueilSombre";
import { TranoSombre } from "./screens/TranoSombre";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<ElementAccueilSombre />} />
        <Route path="/trano" element={<TranoSombre />} />
      </Routes>
    </Router>
  </StrictMode>,
);
