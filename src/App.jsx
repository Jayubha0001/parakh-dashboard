import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import { FeatureFlagsProvider } from "./config/FeatureFlagsContext";

import Dashboard from "./pages/Dashboard";
import PARAKH from "./pages/Parakh";
import PGI from "./pages/PGI";
import SAT from "./pages/SAT";
import Comparison from "./pages/Comparison";
import PMShri from "./pages/PMShri";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import LiveVisits from "./pages/LiveVisits";
import DataDownload from "./pages/DataDownload";
import KeyInsights from "./pages/KeyInsights";
import Settings from "./pages/Settings";

function App() {
  return (
    <LanguageProvider>
      <FeatureFlagsProvider>
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
          <Route path="/data-download" element={<DataDownload />} />
          <Route path="/insights" element={<KeyInsights />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
      </FeatureFlagsProvider>
    </LanguageProvider>
  );
}

export default App;