import { Box, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";
import GroupsIcon from "@mui/icons-material/Groups";
import AppsIcon from "@mui/icons-material/Apps";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { fontDisplay, fontMono } from "../theme/theme";

// A deliberately different look from the navy/gold masthead every other
// page uses — a lighter blue-teal gradient (kept bright rather than the
// near-black navy the rest of the app uses), mint accent text, colourful
// KPI cards — reserved for the Dashboard home page only, so the very
// first thing a visitor sees has its own identity while every other page
// keeps the consistent navy/gold "state instrument" look.
//
// Every number here is real, pulled from data already loaded on this
// page (PGI/SAT summaries, the priority-district list, district count) —
// nothing is invented to fill out the card row.
const TEAL_DARK = "#0B4F6C";
const TEAL_MID = "#146E8C";
const TEAL_BRIGHT = "#2FA8C8";
const MINT = "#8CF0E3";
const GOLD = "#F0B429";

const KPI_ACCENTS = ["#4C8BF5", "#F0B429", "#1F8A70", "#B18CE8", "#E5737E", "#4DB6E5"];

const DashboardHeroBanner = ({ kpis = [], insights = [], filters = null }) => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        mb: { xs: 1.5, md: 2.5 },
        boxShadow: "0 10px 30px rgba(6,46,42,0.22)",
      }}
    >
      {/* Banner strip */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(120deg, ${TEAL_DARK} 0%, ${TEAL_MID} 55%, ${TEAL_BRIGHT} 100%)`,
          color: "#fff",
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 2.5 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "-30%",
            right: "-6%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${MINT}22 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, position: "relative" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,255,255,0.12)",
                fontSize: 24,
                flexShrink: 0,
              }}
            >
              📊
            </Box>
            <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: { xs: 20, md: 26 }, lineHeight: 1.15 }}>
              PARAKH GUJARAT{" "}
              <Box component="span" sx={{ color: MINT }}>
                ANALYTICS
              </Box>
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 22, height: 1, bgcolor: "rgba(255,255,255,0.4)" }} />
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap" }}>
                Every District · Every Score
              </Typography>
            </Box>
            <Box
              onClick={() => navigate("/reports")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.6,
                cursor: "pointer",
                bgcolor: GOLD,
                color: "#16233B",
                fontWeight: 700,
                fontSize: 12.5,
                borderRadius: 2,
                px: 1.6,
                py: 0.8,
                whiteSpace: "nowrap",
                transition: "filter 0.15s ease",
                "&:hover": { filter: "brightness(0.95)" },
              }}
            >
              View Reports
              <ArrowForwardIcon sx={{ fontSize: 15 }} />
            </Box>
          </Box>
        </Box>

        {/* Global filters (Academic Year / Assessment / Grade / District) */}
        {filters && <Box sx={{ position: "relative", mt: 2 }}>{filters}</Box>}
      </Box>

      {/* KPI card row — separate light-tinted cards (one per accent
          colour), not a single continuous strip, so each stat reads as
          its own card the way the reference layout does. */}
      <Box sx={{ bgcolor: "#F4F7FA", p: { xs: 1.25, md: 1.75 } }}>
        <Grid container spacing={1.25}>
          {kpis.map((kpi, i) => {
            const accent = KPI_ACCENTS[i % KPI_ACCENTS.length];
            return (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={kpi.label}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.1,
                    borderRadius: 2.5,
                    bgcolor: `${accent}14`,
                    border: `1px solid ${accent}33`,
                    px: 1.5,
                    py: 1.25,
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 1.75,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: accent,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {kpi.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: "#5B6B85", whiteSpace: "nowrap" }}>
                      {kpi.label}
                    </Typography>
                    <Typography sx={{ fontFamily: fontMono, fontWeight: 700, fontSize: 17, color: "#16233B", lineHeight: 1.3 }}>
                      {kpi.value}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Key Insights strip — gold circular icons on a white row, same
          idea as the KPI cards but calling out a few specific, real
          findings (top district, most improved, needs support) instead
          of raw counts. */}
      {insights.length > 0 && (
        <Grid container spacing={0} sx={{ bgcolor: "#FAFBFD" }}>
          {insights.map((insight, i) => (
            <Grid
              size={{ xs: 6, sm: 3 }}
              key={insight.label}
              sx={{
                borderRight: { sm: i < insights.length - 1 ? "1px solid #EEF1F6" : "none" },
                borderTop: "1px solid #EEF1F6",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, px: 2, py: 1.5 }}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(240,180,41,0.16)",
                    fontSize: 15,
                    flexShrink: 0,
                  }}
                >
                  {insight.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#5B6B85", whiteSpace: "nowrap" }}>
                    {insight.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: fontDisplay,
                      fontWeight: 700,
                      fontSize: 13.5,
                      color: "#16233B",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {insight.value}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export const DASHBOARD_KPI_ICONS = {
  districts: <GroupsIcon sx={{ fontSize: 19 }} />,
  priority: <StarIcon sx={{ fontSize: 19 }} />,
  school: <SchoolIcon sx={{ fontSize: 19 }} />,
  programs: <AppsIcon sx={{ fontSize: 19 }} />,
  pgi: <AssessmentIcon sx={{ fontSize: 19 }} />,
  sat: <FactCheckIcon sx={{ fontSize: 19 }} />,
};

export default DashboardHeroBanner;
