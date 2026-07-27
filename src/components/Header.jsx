import { Box, Grid, Typography } from "@mui/material";
import { colors, fontDisplay, fontMono } from "../theme/theme";

const Header = () => {
  return (
    <Box
      sx={{
        background: `linear-gradient(120deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
        borderRadius: 4,
        color: "#fff",
        p: { xs: 2, md: 3 },
        mb: 4,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(15,23,42,0.25)",
      }}
    >
      {/* Gold hairline signature - marks this as the state ranking system */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${colors.gold}, ${colors.goldLight})`,
        }}
      />

      <Grid container spacing={1.5} sx={{ alignItems: "center" }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography
            sx={{
              fontFamily: fontMono,
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: colors.goldLight,
              fontWeight: 600,
            }}
          >
            Reach to Teach Foundation · Government of Gujarat
          </Typography>

          <Typography
            sx={{
              fontFamily: fontDisplay,
              fontWeight: 700,
              fontSize: { xs: 26, md: 36 },
              mt: 0.3,
              lineHeight: 1.15,
            }}
          >
            PARAKH + PGI + SAT Performance Gujarat
          </Typography>

          <Typography sx={{ mt: 1.5, opacity: 0.85, fontSize: 16 }}>
            Tracking learning outcomes and governance quality across every district
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
            {[
              ["33", "Districts"],
              ["3", "Grades — G3 · G6 · G9"],
              ["6", "PGI Domains"],
              ["8", "SAT Subjects"],
            ].map(([num, label]) => (
              <Box key={label} sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                <Typography sx={{ fontFamily: fontMono, fontWeight: 700, fontSize: 20, color: colors.goldLight }}>
                  {num}
                </Typography>
                <Typography sx={{ fontSize: 13, opacity: 0.8 }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
          <Box
            component="img"
            src="/logo-reach-to-teach.png"
            alt="Reach to Teach Foundation"
            sx={{
              height: 150,
              width: 150,
              borderRadius: 0.5,
              bgcolor: "#fff",
              p: 1,
              flexShrink: 1,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: "flex", gap: -1, mt: -1, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 13, opacity: 0.75, letterSpacing: 1 }}>
              Assessment Cycle: 2024 PARAKH Mastery · PGI-D 2.0 · PM SHRI · SAT Analytics
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Header;
