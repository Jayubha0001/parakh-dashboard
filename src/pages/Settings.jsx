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
const TAB_FLAGS = [
  { key: "attendance", label: "Attendance", description: "The live Power BI attendance feed tab." },
  { key: "crcVisit", label: "CRC Visit", description: "Cluster Resource Centre visit logs." },
  { key: "reports", label: "Reports", description: "The consolidated PDF/print-style reports page." },
  { key: "comparison", label: "Comparison", description: "The district-vs-district comparison tool." },
  { key: "dataDownload", label: "Data Download", description: "Source Excel workbooks that can be downloaded." },
];

const Settings = () => {
  const { language, setLanguage } = useLanguage();
  const { flags, setFlag, isAdmin, unlockAdmin, lockAdmin } = useFeatureFlags();
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const handleUnlock = () => {
    const ok = unlockAdmin(pin.trim());
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
              <Alert severity="success" sx={{ py: 0.5 }}>
                Unlocked — changes below apply immediately, for everyone using this dashboard on this browser.
              </Alert>
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
            </Box>
          )}
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default Settings;
