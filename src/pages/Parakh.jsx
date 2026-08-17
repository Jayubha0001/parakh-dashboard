import { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";

import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import Loading from "../components/Loading";
import HeatMapTable from "../components/HeatMapTable";
import ComparisonSection from "../components/ComparisonSection";
import ContextualSummaryCards from "../components/ContextualSummaryCards";
import DistrictFilterBar from "../components/DistrictFilterBar";
import ActionItemsQueue from "../components/ActionItemsQueue";
import NationalBenchmarkPanel from "../components/NationalBenchmarkPanel";
import { PARAKHCompetencySection } from "../components/DistrictDeepDive";

import {
  loadExcel,
  getSubjectHeatmap,
  getGenderComparison,
  getLocationComparison,
  getManagementComparison,
  getSocialGroupComparison,
  getContextualSummary,
  getPARAKHActionItems,
  getAllDistrictNames,
  getAllDistrictPARAKHActionItems,
  getDistrictCompetencies,
} from "../services/dataService";

// Same three-band read as the rest of the app's heat-maps, just at the
// thresholds this particular indicator (subject mastery %) uses.
const SUBJECT_BANDS = [
  { min: 45, bg: "#E6F4EA", text: "#1B5E20", bar: "#2E7D32", label: "≥45% High" },
  { min: 40, bg: "#FFF3E0", text: "#B15C00", bar: "#FB8C00", label: "40–44.99% Medium" },
  { min: -Infinity, bg: "#FDEAEA", text: "#B71C1C", bar: "#D32F2F", label: "<40% Low" },
];

const PARAKH = () => {
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState({ columns: [], data: [] });
  const [gender, setGender] = useState({ columns: [], data: [] });
  const [location, setLocation] = useState({ columns: [], data: [] });
  const [management, setManagement] = useState({ columns: [], data: [] });
  const [socialGroup, setSocialGroup] = useState({ columns: [], data: [] });
  const [contextual, setContextual] = useState({ columns: [], data: [] });
  const [actionItems, setActionItems] = useState([]);
  const [allDistrictNames, setAllDistrictNames] = useState([]);
  const [allDistrictItems, setAllDistrictItems] = useState([]);
  const [district, setDistrict] = useState("All");
  const [competencies, setCompetencies] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const workbook = await loadExcel();

      setSubject(getSubjectHeatmap(workbook));
      setGender(getGenderComparison(workbook));
      setLocation(getLocationComparison(workbook));
      setManagement(getManagementComparison(workbook));
      setSocialGroup(getSocialGroupComparison(workbook));
      setContextual(getContextualSummary(workbook));
      setActionItems(getPARAKHActionItems(workbook));
      setAllDistrictNames(getAllDistrictNames(workbook));
      setAllDistrictItems(getAllDistrictPARAKHActionItems(workbook));

      setLoading(false);
    }

    fetchData();
  }, []);

  // Full competency-wise breakdown for whichever district is picked —
  // loadExcel() is cached, so re-calling it here is cheap.
  useEffect(() => {
    if (district === "All") {
      setCompetencies(null);
      return;
    }
    let cancelled = false;
    loadExcel().then((workbook) => {
      if (cancelled) return;
      setCompetencies({
        g3: getDistrictCompetencies(workbook, "PARAKH_Foundational_G3", district),
        g6: getDistrictCompetencies(workbook, "PARAKH_Preparatory_G6", district),
        g9: getDistrictCompetencies(workbook, "PARAKH_Middle_G9", district),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [district]);

  if (loading) {
    return (
      <DashboardLayout>
        <Header />
        <Loading message="Loading PARAKH breakdowns from Excel..." />
      </DashboardLayout>
    );
  }

  const districts = ["All", ...new Set(subject.data.map((d) => d.District))];

  // Every section below is one-row-per-district, so a single generic
  // filter narrows all of them consistently. Contextual Variables is
  // excluded — its rows are questionnaire types (School/Teacher/Pupil),
  // not districts, so a district filter doesn't apply to it.
  const byDistrict = (arr) =>
    district === "All" ? arr : arr.filter((d) => d.District === district);

  return (
    <DashboardLayout>
      <Header />

      <DistrictFilterBar district={district} setDistrict={setDistrict} districts={districts} />

      <NationalBenchmarkPanel
        district={district}
        subjectData={subject.data}
        genderData={gender.data}
        locationData={location.data}
        managementData={management.data}
        socialGroupData={socialGroup.data}
      />

      <HeatMapTable
        icon="📚"
        title="Subject-wise Mastery Heat-map (% students at mastery, by District)"
        bands={SUBJECT_BANDS}
        columns={subject.columns}
        data={byDistrict(subject.data)}
        allData={subject.data}
        isAverageColumn={(col) => col.endsWith("Average")}
        getValue={(row, col) => (row[col] ?? 0) * 100}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ComparisonSection
            title="Boys vs Girls — Average Performance"
            icon="🚻"
            columns={gender.columns}
            data={byDistrict(gender.data)}
            allData={gender.data}
            color="#8E24AA"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ComparisonSection
            title="Rural vs Urban — Average Performance"
            icon="🏘️"
            columns={location.columns}
            data={byDistrict(location.data)}
            allData={location.data}
            color="#00897B"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ComparisonSection
            title="School Management Type — Average Performance"
            icon="🏫"
            columns={management.columns}
            data={byDistrict(management.data)}
            allData={management.data}
            color="#5D4037"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ComparisonSection
            title="Social Group — Average Performance & Equity Gap"
            icon="🤝"
            columns={socialGroup.columns}
            data={byDistrict(socialGroup.data)}
            allData={socialGroup.data}
            color="#C62828"
          />
        </Grid>
      </Grid>

      {district !== "All" && competencies && (
        <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 2.5, border: "1px solid #E4E7F0" }} elevation={0}>
          <CardContent>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
              📖 {district} — Competency-wise Mastery vs National Benchmark
            </Typography>
            <PARAKHCompetencySection competencies={competencies} />
          </CardContent>
        </Card>
      )}

      <ContextualSummaryCards data={contextual.data} />

      <ActionItemsQueue
        items={actionItems}
        allDistricts={allDistrictNames}
        allItems={allDistrictItems}
        syncDistrict={district}
      />
    </DashboardLayout>
  );
};

export default PARAKH;