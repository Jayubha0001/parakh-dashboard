import { Box, Grid, Typography, Chip } from "@mui/material";
import { colors, fontDisplay, fontMono } from "../theme/theme";

// A thin diamond-lattice line pattern, evoking the geometric weave of
// Patola silk (Patan, Gujarat) — a specific, real reference rather than a
// generic decorative texture, kept faint enough to read as craftsmanship
// in the background rather than compete with the headline.
const PATOLA_PATTERN = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
    <path d="M28 0 L56 28 L28 56 L0 28 Z" fill="none" stroke="${colors.goldLight}" stroke-width="0.75" opacity="0.35"/>
    <path d="M28 14 L42 28 L28 42 L14 28 Z" fill="none" stroke="${colors.goldLight}" stroke-width="0.75" opacity="0.35"/>
  </svg>
`)}`;

// One header for the whole app. Pages that just need the app-wide masthead
// (Dashboard, PARAKH, Comparison, PM Shri, Reports) call <Header /> with no
// props. Pages that used to stack a second, page-specific hero underneath
// it (PGI, SAT) instead pass pageTitle/pageSubtitle/statChip/controls here,
// so there's exactly one navy header block on screen, not two.
const Header = ({ pageEyebrow, pageIcon, pageTitle, pageSubtitle, statChip, controls }) => {
  const isPageMode = Boolean(pageTitle);

  return (
    <Box
      sx={{
        background: `linear-gradient(120deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
        borderRadius: 4,
        color: "#fff",
        p: { xs: 2, md: 3 },
        mb: 2.5,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(15,23,42,0.25)",
      }}
    >
      {/* Patola-lattice signature texture, confined to the right third so
          it reads as an accent motif behind the crest, not wallpaper. */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: { xs: "45%", md: "38%" },
          backgroundImage: `url("${PATOLA_PATTERN}")`,
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(90deg, transparent 0%, black 35%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 35%)",
          pointerEvents: "none",
        }}
      />

      {/* Faint radial highlight behind the logo — adds depth to the navy
          panel without competing with the text on the left. */}
      <Box
        sx={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.navyLight} 0%, transparent 70%)`,
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

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

      <Grid container spacing={1.5} sx={{ alignItems: "center", position: "relative" }}>
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
            {pageEyebrow || "Reach to Teach Foundation · Government of Gujarat"}
          </Typography>

          <Typography
            sx={{
              fontFamily: fontDisplay,
              fontWeight: 700,
              fontSize: { xs: 24, md: 32 },
              mt: 0.3,
              lineHeight: 1.15,
            }}
          >
            {pageIcon ? `${pageIcon} ` : ""}
            {pageTitle || "PARAKH + PGI + SAT Performance Gujarat"}
          </Typography>

          <Typography sx={{ mt: 1.2, opacity: 0.85, fontSize: 15 }}>
            {pageSubtitle || "Tracking learning outcomes and governance quality across every district"}
          </Typography>

          {controls && <Box sx={{ mt: 1.5 }}>{controls}</Box>}

          {/* App-wide stats row only shows on the default masthead — a
              page already showing its own hero (PGI, SAT) has its own more
              relevant stat cards just below, so repeating these here would
              just be a second copy of the same idea. */}
          {!isPageMode && (
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
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
          {statChip ? (
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                textAlign: "center",
                bgcolor: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                minWidth: 220,
              }}
            >
              <Typography sx={{ fontSize: 13, opacity: 0.8 }}>{statChip.label}</Typography>
              <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 36, mt: 0.3 }}>
                {statChip.value}
                {statChip.suffix && (
                  <Typography component="span" sx={{ fontSize: 15, opacity: 0.75 }}>
                    {" "}
                    {statChip.suffix}
                  </Typography>
                )}
              </Typography>
              {statChip.badge && (
                <Chip
                  label={statChip.badge}
                  size="small"
                  sx={{ mt: 1, bgcolor: colors.gold, color: colors.navy, fontWeight: 700 }}
                />
              )}
            </Box>
          ) : (
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
          )}
        </Grid>

        {!isPageMode && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", mt: -1, flexWrap: "wrap" }}>
              <Typography sx={{ fontSize: 13, opacity: 0.75, letterSpacing: 1 }}>
                Assessment Cycle: 2024 PARAKH Mastery · PGI-D 2.0 · PM SHRI · SAT Analytics
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Header;
