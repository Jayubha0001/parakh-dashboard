import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";

import Dashboard from "./pages/Dashboard";
import PARAKH from "./pages/Parakh";
import PGI from "./pages/PGI";
import SAT from "./pages/SAT";
import Comparison from "./pages/Comparison";
import PMShri from "./pages/PMShri";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import LiveVisits from "./pages/LiveVisits";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/parakh" element={<PARAKH />} />
          <Route path="/pgi" element={<PGI />} />
          <Route path="/sat" element={<SAT />} />
          <Route path="/comparison" element={<Comparison />} />
          <Route path="/pmshri" element={<PMShri />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/live-visits" element={<LiveVisits />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;