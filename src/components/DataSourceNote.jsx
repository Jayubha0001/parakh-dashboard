import { Box, Typography } from "@mui/material";
import { colors, fontMono } from "../theme/theme";

// Small footer note citing exactly which Excel file(s) this page's numbers
// come from, with a direct download link — so anyone looking at the
// dashboard can trace a figure back to its source workbook instead of
// having to ask.
const DataSourceNote = ({ sources = [] }) => {
  if (!sources.length) return null;

  return (
    <Box
      sx={{
        mt: 4,
        mb: 1,
        p: 2,
        borderRadius: 2,
        border: "1px dashed #CBD3E1",
        bgcolor: "#F8F9FC",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.navy, whiteSpace: "nowrap" }}>
        📁 Data Source:
      </Typography>
      {sources.map((s) => (
        <Box
          key={s.href}
          component="a"
          href={s.href}
          download
          sx={{
            fontSize: 12,
            fontFamily: fontMono,
            fontWeight: 600,
            color: "#1976D2",
            textDecoration: "none",
            border: "1px solid #D6E3F5",
            bgcolor: "#EEF4FD",
            borderRadius: 1,
            px: 1,
            py: 0.4,
            "&:hover": { textDecoration: "underline", bgcolor: "#E1EDFB" },
          }}
        >
          {s.label} ⬇
        </Box>
      ))}
    </Box>
  );
};

export default DataSourceNote;
