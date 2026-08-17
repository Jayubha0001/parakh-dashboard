import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  MenuItem,
  TextField,
  Button,
  Chip,
  Divider,
  Paper,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";

import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import Loading from "../components/Loading";
import { bandColor } from "../components/CombinedBandSummary";
import DistrictDeepDive from "../components/DistrictDeepDive";
import ActionItemsQueue from "../components/ActionItemsQueue";

import {
  loadExcel,
  getCombinedRanking,
  getSubjectHeatmap,
  getGenderComparison,
  getLocationComparison,
  getDistrictPGIIndicators,
  getDistrictCompetencies,
  getPriorityActionItems,
  getAllDistrictNames,
  getAllDistrictActionItems,
} from "../services/dataService";

import { downloadCSV } from "../utils/helpers";

const Reports = () => {
  const [loading, setLoading] = useState(true);

  const [workbook, setWorkbook] = useState(null);
  const [combined, setCombined] = useState({ districts: [] });
  const [subject, setSubject] = useState({ columns: [], data: [] });
  const [gender, setGender] = useState({ data: [] });
  const [location, setLocation] = useState({ data: [] });
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [actionItems, setActionItems] = useState([]);
  const [allDistrictNames, setAllDistrictNames] = useState([]);
  const [allDistrictItems, setAllDistrictItems] = useState([]);

  const [pgiDetail, setPgiDetail] = useState({ indicators: [], domainSummary: [], overall: null });
  const [competencies, setCompetencies] = useState({ g3: [], g6: [], g9: [] });

  useEffect(() => {
    async function fetchData() {
      const wb = await loadExcel();
      setWorkbook(wb);

      const c = getCombinedRanking(wb);
      setCombined(c);
      setSubject(getSubjectHeatmap(wb));
      setGender(getGenderComparison(wb));
      setLocation(getLocationComparison(wb));
      setSelectedDistrict(c.districts[0]?.District || "");
      setActionItems(getPriorityActionItems(wb));
      setAllDistrictNames(getAllDistrictNames(wb));
      setAllDistrictItems(getAllDistrictActionItems(wb));

      setLoading(false);
    }

    fetchData();
  }, []);

  // Recompute the district deep-dive (70 PGI indicators + competency tables)
  // whenever the selected district changes.
  useEffect(() => {
    if (!workbook || !selectedDistrict) return;

    setPgiDetail(getDistrictPGIIndicators(workbook, selectedDistrict));
    setCompetencies({
      g3: getDistrictCompetencies(workbook, "PARAKH_Foundational_G3", selectedDistrict),
      g6: getDistrictCompetencies(workbook, "PARAKH_Preparatory_G6", selectedDistrict),
      g9: getDistrictCompetencies(workbook, "PARAKH_Middle_G9", selectedDistrict),
    });
  }, [workbook, selectedDistrict]);

  if (loading) {
    return (
      <DashboardLayout>
        <Box className="no-print"><Header /></Box>
        <Loading message="Preparing district reports..." />
      </DashboardLayout>
    );
  }

  const districtRow = combined.districts.find((d) => d.District === selectedDistrict);
  const subjectRow = subject.data.find((d) => d.District === selectedDistrict);
  const genderRow = gender.data.find((d) => d.District === selectedDistrict);
  const locationRow = location.data.find((d) => d.District === selectedDistrict);

  const handleExportAll = () => {
    const header = [
      "Rank",
      "District",
      "PGI-D %",
      "PGI-D Grade",
      "PARAKH %",
      "Composite %",
      "Performance Band",
    ];

    const rows = combined.districts.map((d) => [
      d.Rank,
      d.District,
      d.PGIDScore.toFixed(2),
      d.PGIDGrade,
      d.PARAKHScore.toFixed(2),
      d.CompositeScore.toFixed(2),
      d.Band,
    ]);

    downloadCSV([header, ...rows], "Gujarat_Combined_Ranking.csv");
  };

  return (
    <DashboardLayout>
      <Box className="no-print"><Header /></Box>

      {/* Controls */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 4, overflow: "hidden", mt: 2 }}
        className="no-print"
      >
        <Box
          sx={{
            background: "linear-gradient(120deg, #0F172A 0%, #1E3A5F 100%)",
            color: "#fff",
            px: 3,
            py: 2.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 20 }}>
              📄 District Report Generator
            </Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.85, mt: 0.3 }}>
              Pick a district for a printable report card, or export the full state ranking
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportAll}
            sx={{
              bgcolor: "#F0B429",
              color: "#16233B",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { bgcolor: "#FFD54F" },
            }}
          >
            Export All Districts (CSV)
          </Button>
        </Box>

        <Box sx={{ p: 3 }}>
          <TextField
            select
            label="Select District"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            sx={{ minWidth: 260 }}
          >
            {combined.districts.map((d) => (
              <MenuItem key={d.District} value={d.District}>
                {d.District}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {/* Printable Report Card */}
      {districtRow && (
        <Card sx={{ borderRadius: 3, boxShadow: 4, mt: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {districtRow.District}
                </Typography>
                <Typography color="text.secondary">
                  Gujarat PARAKH + PGI-D Report Card · 2024-25
                </Typography>
              </Box>

              <Chip
                label={`Rank #${districtRow.Rank} of 33`}
                color="primary"
                sx={{ fontWeight: "bold", fontSize: 14, p: 2 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography color="text.secondary" fontSize={13}>
                  PGI-D Score
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {districtRow.PGIDScore.toFixed(1)}%
                </Typography>
                <Typography fontSize={13}>{districtRow.PGIDGrade}</Typography>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <Typography color="text.secondary" fontSize={13}>
                  PARAKH Overall Mastery
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {districtRow.PARAKHScore.toFixed(1)}%
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <Typography color="text.secondary" fontSize={13}>
                  Composite Score
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {districtRow.CompositeScore.toFixed(1)}%
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <Typography color="text.secondary" fontSize={13}>
                  Performance Band
                </Typography>
                <Chip
                  label={districtRow.Band}
                  sx={{
                    bgcolor: bandColor(districtRow.Band),
                    color: "#fff",
                    fontWeight: "bold",
                    mt: 0.5,
                  }}
                />
              </Grid>
            </Grid>

            {subjectRow && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  📚 Subject-wise Mastery
                </Typography>

                <Grid container spacing={2}>
                  {subject.columns.map((col) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={col}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "#f4f7fc",
                          textAlign: "center",
                        }}
                      >
                        <Typography fontSize={11} color="text.secondary">
                          {col}
                        </Typography>
                        <Typography fontWeight="bold">
                          {((subjectRow[col] || 0) * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {(genderRow || locationRow) && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  ⚖️ Equity Snapshot
                </Typography>

                <Grid container spacing={2}>
                  {genderRow && (
                    <>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography fontSize={12} color="text.secondary">
                          Boys Avg
                        </Typography>
                        <Typography fontWeight="bold">
                          {(genderRow["Boys Avg (%)"] * 100).toFixed(1)}%
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography fontSize={12} color="text.secondary">
                          Girls Avg
                        </Typography>
                        <Typography fontWeight="bold">
                          {(genderRow["Girls Avg (%)"] * 100).toFixed(1)}%
                        </Typography>
                      </Grid>
                    </>
                  )}

                  {locationRow && (
                    <>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography fontSize={12} color="text.secondary">
                          Rural Avg
                        </Typography>
                        <Typography fontWeight="bold">
                          {(locationRow["Rural Avg (%)"] * 100).toFixed(1)}%
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography fontSize={12} color="text.secondary">
                          Urban Avg
                        </Typography>
                        <Typography fontWeight="bold">
                          {(locationRow["Urban Avg (%)"] * 100).toFixed(1)}%
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </>
            )}

            <Box sx={{ textAlign: "right", mt: 2 }} className="no-print">
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
              >
                Print / Save as PDF
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {pgiDetail.overall && (
        <DistrictDeepDive pgiDetail={pgiDetail} competencies={competencies} />
      )}

      <Box className="no-print">
        <ActionItemsQueue
          items={actionItems}
          allDistricts={allDistrictNames}
          allItems={allDistrictItems}
          syncDistrict={selectedDistrict}
        />
      </Box>
    </DashboardLayout>
  );
};

export default Reports;
