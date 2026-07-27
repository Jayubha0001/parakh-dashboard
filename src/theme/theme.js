import { createTheme } from "@mui/material/styles";

// -----------------------------------------------------------------
// Gujarat PARAKH + PGI — Design System
//
// Navy + gold reads as "state civic instrument" rather than a generic
// SaaS dashboard. Navy already existed on the sidebar (#0F172A) — this
// theme extends that choice across the whole app instead of leaving it
// isolated. Gold marks rank / achievement (medallions, top scores) so
// it always means something rather than decorating everything.
//
// Fraunces (serif, display) carries headlines and the big hero figures.
// Poppins is the everyday UI voice. IBM Plex Mono renders every score,
// percentage, and rank — a data-dashboard should look like it is built
// from figures, not from prose.
// -----------------------------------------------------------------

export const colors = {
  navy: "#0F172A",
  navyLight: "#1E3A5F",
  gold: "#F0B429",
  goldLight: "#FFD54F",
  teal: "#1F8A70",
  canvas: "#F5F6FA",
  ink: "#16233B",
  slate: "#5B6B85",
};

const theme = createTheme({
  palette: {
    primary: { main: colors.navy, light: colors.navyLight },
    secondary: { main: colors.gold, light: colors.goldLight },
    success: { main: "#2E7D32" },
    warning: { main: "#FB8C00" },
    error: { main: "#D32F2F" },
    background: { default: colors.canvas, paper: "#FFFFFF" },
    text: { primary: colors.ink, secondary: colors.slate },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Poppins", "Roboto", sans-serif',
    h1: { fontFamily: '"Fraunces", serif', fontWeight: 700 },
    h2: { fontFamily: '"Fraunces", serif', fontWeight: 700 },
    h3: { fontFamily: '"Fraunces", serif', fontWeight: 700 },
    h4: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h5: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
  },
});

// Utility className-friendly font stacks for direct sx usage
export const fontDisplay = '"Fraunces", serif';
export const fontMono = '"IBM Plex Mono", monospace';

export default theme;
