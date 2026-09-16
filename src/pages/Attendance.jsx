import { Box, Paper, Typography, Chip } from "@mui/material";
import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import { colors } from "../theme/theme";

const POWER_BI_URL =
  "https://app.powerbi.com/view?r=eyJrIjoiMmIyYjhhODEtNGMwMy00YWJhLTkyYTQtNWVmYTU4YjU3ZjBmIiwidCI6ImI2OTNmYzBiLTczNDEtNDQ2Zi1iMmY3LTk1MzQzNjQ2ZTI5NSJ9";

// This page's own accent — the same orange used for "Attendance" in the
// sidebar — kept as a single, deliberate identity colour rather than a
// multi-stop rainbow, so the page reads as one more considered member of
// the app's navy/gold family instead of a clashing insert.
const ACCENT = "#F2994A";
const ACCENT_DARK = "#B36A1E";

// What this particular report actually covers — kept as plain descriptive
// chips (not invented numbers) so the page gives some orientation before
// the iframe loads, without fabricating any figures of its own.
const SCOPE_CHIPS = [
  "Teacher & Student Submission",
  "Presence %",
  "MDM (Mid-Day Meal)",
  "Alpahar Tracking",
  "District → Block → Cluster → School",
];

// A dedicated tab for the live Power BI attendance report. Styled with its
// own accent colour (orange, matching its sidebar icon) so it's visibly
// its own thing — a live external feed — while still following the same
// card conventions (white card, coloured top border, uppercase kicker,
// pulsing "live" dot) every other snapshot panel in the app already uses,
// so it doesn't feel like a mismatched drop-in.
const Attendance = () => {
  return (
    <DashboardLayout>
      <Header
        pageIcon="🧑‍🏫"
        pageEyebrow="Attendance Monitoring & Analysis System — State Level"
        pageTitle="Attendance Dashboard"
        pageSubtitle="Live teacher & student submission and presence — by district, block, cluster and school"
      />

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          borderTop: `3px solid ${ACCENT}`,
          border: "1px solid #E4E7F0",
          background: "#fff",
          p: { xs: 1.75, sm: 2.5 },
          boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
          <Box>
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: ACCENT_DARK, mb: 0.4 }}>
              Live Power BI Feed
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
              {SCOPE_CHIPS.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    height: 22,
                    color: ACCENT_DARK,
                    bgcolor: "rgba(242,153,74,0.10)",
                    border: `1px solid rgba(242,153,74,0.3)`,
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, flexShrink: 0 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: ACCENT,
                boxShadow: `0 0 0 4px rgba(242,153,74,0.22)`,
              }}
            />
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase", color: colors.slate || "#5B6B85" }}>
              Refreshes from source
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #E4E7F0",
            boxShadow: "0 1px 0 rgba(15,23,42,0.03) inset",
          }}
        >
          <iframe
            title="Attendance Power BI Dashboard"
            src={POWER_BI_URL}
            width="100%"
            height="820"
            frameBorder="0"
            allowFullScreen
            style={{ display: "block", border: "none" }}
          />
        </Box>

        <Typography sx={{ fontSize: 11.5, color: "#9AA5B1", mt: 1.5 }}>
          This panel embeds Gujarat School Education Department's own Power BI report directly — it isn't part of the
          PARAKH/PGI/SAT/PM Shri data pulled in elsewhere on this dashboard, so it isn't affected by the District filters
          on those pages.
        </Typography>
      </Paper>
    </DashboardLayout>
  );
};

export default Attendance;
