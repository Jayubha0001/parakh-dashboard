import { Box, Paper, Typography, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionIcon from "@mui/icons-material/Description";
import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";

// Real files this dashboard is actually built from — living in /public,
// so they're already served at these exact paths. No placeholder links:
// every card here downloads the genuine source workbook.
const FILES = [
  {
    name: "Gujarat_PARAKH_PGI_Comprehensive_Template.xlsx",
    label: "PARAKH + PGI 2.0 — Master Workbook",
    description: "District-wise PARAKH learning outcomes and PGI 2.0 governance indicators, 2024-25.",
  },
  {
    name: "SAT_Perfomance_sem_1.xlsx",
    label: "SAT — Semester 1 Results",
    description: "Student Assessment Test performance by district, grade and subject — Semester 1.",
  },
  {
    name: "PM_SHRI_GSQAC_Result_GOG_GOI.xlsx",
    label: "PM Shri — GSQAC Results (GOI + GOG)",
    description: "School-wise GSQAC quality grading for PM Shri schools under both GOI and GOG.",
  },
];

const DataDownload = () => {
  return (
    <DashboardLayout>
      <Header
        pageIcon="⬇️"
        pageEyebrow="Source Data"
        pageTitle="Data Download"
        pageSubtitle="The underlying workbooks this dashboard is built from — download any of them directly"
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {FILES.map((f) => (
          <Paper
            key={f.name}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #E4E7F0",
              p: 2.25,
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(31,138,112,0.12)",
                color: "#1F8A70",
                flexShrink: 0,
              }}
            >
              <DescriptionIcon />
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#16233B" }}>{f.label}</Typography>
              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{f.description}</Typography>
            </Box>
            <Button
              variant="contained"
              href={`/${f.name}`}
              download
              startIcon={<DownloadIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#F0B429",
                color: "#16233B",
                "&:hover": { bgcolor: "#DDA320" },
              }}
            >
              Download
            </Button>
          </Paper>
        ))}
      </Box>

      <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 2 }}>
        These are the exact source files loaded by this dashboard — nothing here has been re-processed or summarised.
      </Typography>
    </DashboardLayout>
  );
};

export default DataDownload;
