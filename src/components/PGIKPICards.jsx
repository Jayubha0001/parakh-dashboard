import { Card, CardContent, Typography, Grid, Box, Paper } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { fontDisplay, fontMono } from "../theme/theme";

// Gradient KPI pill cards — same treatment as the Dashboard/SAT pages, so
// every page in the app reads as one consistent dashboard rather than a
// mix of card styles.
const PGIKPICards = ({ overall, totalDistricts, topDistrict, lowestDistrict }) => {
  const cards = [
    {
      label: "State Overall Score",
      value: `${overall?.score?.toFixed(1) ?? "-"}`,
      sub: `/ ${overall?.maxWeight ?? 1000}`,
      gradient: "linear-gradient(135deg, #6A3DB8, #9B6DE0)",
      Icon: AccountBalanceIcon,
    },
    {
      label: "% Achieved",
      value: `${overall?.percentAchieved?.toFixed(1) ?? 0}%`,
      sub: overall?.grade || "-",
      gradient: "linear-gradient(135deg, #1F8A70, #3FB897)",
      Icon: TrendingUpIcon,
    },
    {
      label: "Districts Assessed",
      value: totalDistricts ?? 0,
      sub: "PGI-D 2.0",
      gradient: "linear-gradient(135deg, #1976D2, #5AA6EA)",
      Icon: LocationCityIcon,
    },
    {
      label: "Top District",
      value: topDistrict?.District || "-",
      sub: `${topDistrict?.PercentAchieved?.toFixed(1) ?? 0}%`,
      gradient: "linear-gradient(135deg, #B8860B, #F0B429)",
      Icon: EmojiEventsIcon,
    },
    {
      label: "Needs Support",
      value: lowestDistrict?.District || "-",
      sub: `${lowestDistrict?.PercentAchieved?.toFixed(1) ?? 0}%`,
      gradient: "linear-gradient(135deg, #D32F2F, #E5737E)",
      Icon: PriorityHighIcon,
    },
  ];

  return (
    <Grid container spacing={1.5}>
      {cards.map((kpi) => (
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={kpi.label}>
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              borderRadius: 2.5,
              background: kpi.gradient,
              color: "#fff",
              height: "100%",
              p: { xs: 1.3, sm: 1.6 },
              display: "flex",
              alignItems: "center",
              gap: 1.3,
              overflow: "hidden",
              boxShadow: "0 4px 10px rgba(15,23,42,0.10)",
            }}
          >
            <kpi.Icon
              sx={{
                position: "absolute",
                right: -10,
                bottom: -14,
                fontSize: 84,
                opacity: 0.16,
                transform: "rotate(-12deg)",
              }}
            />
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,255,255,0.22)",
                flexShrink: 0,
                zIndex: 1,
              }}
            >
              <kpi.Icon sx={{ fontSize: 18 }} />
            </Box>
            <Box sx={{ minWidth: 0, zIndex: 1 }}>
              <Typography sx={{ fontSize: 10.5, opacity: 0.9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, lineHeight: 1.2 }}>
                {kpi.label}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
                <Typography
                  sx={{
                    fontFamily: fontDisplay,
                    fontWeight: 700,
                    fontSize: 21,
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {kpi.value}
                </Typography>
                {kpi.sub && (
                  <Typography sx={{ fontFamily: fontMono, fontSize: 11.5, fontWeight: 700, opacity: 0.95, whiteSpace: "nowrap" }}>
                    {kpi.sub}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default PGIKPICards;
