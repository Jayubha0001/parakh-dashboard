import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import PARAKH from "./pages/Parakh";
import PGI from "./pages/PGI";
import SAT from "./pages/SAT";
import Comparison from "./pages/Comparison";
import PMShri from "./pages/PMShri";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/parakh" element={<PARAKH />} />
        <Route path="/pgi" element={<PGI />} />
        <Route path="/sat" element={<SAT />} />
        <Route path="/comparison" element={<Comparison />} />
        <Route path="/pmshri" element={<PMShri />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;