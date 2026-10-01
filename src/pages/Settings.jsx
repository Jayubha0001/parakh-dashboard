import { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Switch, Alert } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import { useLanguage } from "../i18n/LanguageContext";
import { useFeatureFlags } from "../config/FeatureFlagsContext";

// Which tabs the admin panel below can toggle, and the label/description
// shown for each — kept as plain data so adding a fifth flag later is a
// one-line change here, not new markup.
const EXTRA_FLAGS = [
  { group: "Dashboard sections", items: [
    ["dash_kpis", "KPI strip (top cards)"], ["dash_kpiCounts", "KPI strip: district counts (33 / 10 / 23 / 4)"], ["dash_map", "District map"], ["dash_donut", "Overall performance (donut)"],
    ["dash_priorityVsOther", "Priority vs Other chart"], ["dash_breakdown", "Domain / Grade-wise chart"],
    ["dash_priorityList", "Priority Districts chart"], ["cmp_pgi", "Comparison: PGI-D 2024-25 vs 2025-26"],
    ["cmp_sat", "Comparison: SAT Sem 1 vs Sem 2"], ["cmp_pmshri", "Comparison: PM SHRI enrolment & GSQAC"],
    ["dash_weakest", "Weakest Indicators"], ["dash_deepDive", "District deep-dive (after selecting a district)"],
  ] },
  { group: "Assessment dropdown options", items: [
    ["as_overall", "Overall"], ["as_pgi", "PGI-D"], ["as_parakh", "PARAKH"], ["as_sat", "SAT"],
  ] },
  { group: "Program pages (PARAKH, PGI, SAT, PM SHRI)", items: [
    ["pg_snapshot", "District Snapshot panel (map + charts)"], ["pg_actions", "Action Items"],
  ] },
];

const TAB_FLAGS = [
  { key: "dashboard", label: "Dashboard", description: "The one-page overview." },
  { key: "parakh", label: "PARAKH", description: "PARAKH 2024 district analysis." },
  { key: "pgi", label: "PGI 2.0", description: "PGI-D 2024-25 and 2025-26." },
  { key: "sat", label: "SAT", description: "Semester 1 and Semester 2 results." },
  { key: "pmshri", label: "PM Shri", description: "PM SHRI and GSQAC results." },
  { key: "insights", label: "Key Insights", description: "Comparisons and weakest indicators." },
  { key: "attendance", label: "Attendance", description: "The live Power BI attendance feed tab." },
  { key: "crcVisit", label: "CRC Visit", description: "Cluster Resource Centre visit logs." },
  { key: "reports", label: "Reports", description: "The consolidated PDF/print-style reports page." },
  { key: "comparison", label: "Comparison", description: "The district-vs-district comparison tool." },
  { key: "dataDownload", label: "Data Download", description: "Source Excel workbooks that can be downloaded." },
];

const Settings = () => {
  const { language, setLanguage } = useLanguage();
  const { flags, setFlag, isAdmin, unlockAdmin, lockAdmin, shared, saveError } = useFeatureFlags();
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const handleUnlock = async () => {
    const ok = await unlockAdmin(pin.trim());
    setPinError(!ok);
    if (ok) setPin("");
  };

  return (
    <DashboardLayout>
      <Header
        pageIcon="⚙️"
        pageEyebrow="Preferences"
        pageTitle="Settings"
        pageSubtitle="Dashboard-wide preferences, plus admin-only tab management."
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 560 }}>
        {/* Language — open to everyone */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #E4E7F0", p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#16233B", mb: 0.5 }}>Language</Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 2 }}>
            Applies to the sidebar and the shared District Filter / Snapshot panels across the dashboard.
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            {[
              { code: "en", label: "English" },
              { code: "gu", label: "ગુજરાતી" },
            ].map((opt) => (
              <Box
                key={opt.code}
                component="button"
                onClick={() => setLanguage(opt.code)}
                sx={{
                  border: language === opt.code ? "2px solid #F0B429" : "1px solid #E4E7F0",
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  bgcolor: language === opt.code ? "rgba(240,180,41,0.1)" : "#fff",
                  color: "#16233B",
                  fontFamily: "inherit",
                }}
              >
                {opt.label}
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Tab management — admin-gated. There's no real backend/auth in
            this static site, so this PIN is a soft gate only (it stops a
            casual viewer from flipping tabs by accident) — not real
            security. Anyone who should manage tabs needs the PIN shared
            with them separately. */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #E4E7F0", p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#16233B" }}>Manage Tabs (Admin)</Typography>
            {isAdmin && (
              <Button
                size="small"
                startIcon={<LockIcon fontSize="small" />}
                onClick={lockAdmin}
                sx={{ textTransform: "none", fontWeight: 600, color: "text.secondary" }}
              >
                Lock
              </Button>
            )}
          </Box>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 2 }}>
            Turn sidebar tabs on or off. This is a soft admin lock, not real account security — anyone with the password
            can make changes.
          </Typography>

          {!isAdmin ? (
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <TextField
                size="small"
                type="password"
                label="Admin Password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                error={pinError}
                helperText={pinError ? "Incorrect password" : " "}
              />
              <Button
                variant="contained"
                startIcon={<LockOpenIcon />}
                onClick={handleUnlock}
                sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#16233B", "&:hover": { bgcolor: "#0F172A" } }}
              >
                Unlock
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Alert severity={shared ? "success" : "warning"} sx={{ py: 0.5 }}>
                {shared ? "Unlocked — every switch below is saved for everyone using this dashboard, instantly." : "Unlocked (local mode) — the shared store is not connected, so changes below apply on this browser only."}
              </Alert>
              {saveError && <Alert severity="error" sx={{ py: 0.5 }}>{saveError}</Alert>}
              {TAB_FLAGS.map((tab) => (
                <Box
                  key={tab.key}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid #EEF1F6",
                    borderRadius: 2,
                    px: 1.5,
                    py: 1,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: "#16233B" }}>{tab.label}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>{tab.description}</Typography>
                  </Box>
                  <Switch checked={!!flags[tab.key]} onChange={(e) => setFlag(tab.key, e.target.checked)} />
                </Box>
              ))}
              {EXTRA_FLAGS.map((g) => (
                <Box key={g.group}>
                  <Typography sx={{ fontWeight: 700, fontSize: 13.5, mt: 1, mb: 0.5 }}>{g.group}</Typography>
                  {g.items.map(([key, label]) => (
                    <Box key={key} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 0.25 }}>
                      <Typography sx={{ fontSize: 13 }}>{label}</Typography>
                      <Switch size="small" checked={key === "dash_kpiCounts" ? flags[key] === true : flags[key] !== false} onChange={(e) => setFlag(key, e.target.checked)} />
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default Settings;
