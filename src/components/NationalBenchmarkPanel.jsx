import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { PARAKH_NATIONAL_BENCHMARKS } from "../constants/parakhNationalBenchmarks";

// Maps a PDF benchmark row's grade+subject name to the exact column name
// used in the "PARAKH_Subject_Performance" sheet, so a selected district's
// own score can be looked up and shown alongside Gujarat/National.
const GRADE_LABEL = { G3: "Grade 3", G6: "Grade 6", G9: "Grade 9" };

const SUBJECT_COLUMN_ALIASES = {
  Language: "Language",
  Mathematics: "Mathematics",
  "The World Around Us": "The World Around Us",
  Science: "Science",
  "Social Science": "Social Science",
};

const BAR_COLORS = {
  district: "#F0B429",
  state: "#0F172A",
  national: "#8B94A8",
};

const ThreeWayRow = ({ name, state, national, district }) => {
  const bars = [
    district != null && { label: "District", value: district, color: BAR_COLORS.district },
    { label: "Gujarat", value: state, color: BAR_COLORS.state },
    { label: "National", value: national, color: BAR_COLORS.national },
  ].filter(Boolean);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, mb: 0.5 }}>{name}</Typography>

      {bars.map((b) => (
        <Box key={b.label} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.4 }}>
          <Typography sx={{ fontSize: 10.5, width: 56, flexShrink: 0, color: "text.secondary" }}>
            {b.label}
          </Typography>
          <Box sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: "#EEF0F5", overflow: "hidden" }}>
            <Box sx={{ width: `${Math.min(b.value, 100)}%`, height: "100%", bgcolor: b.color }} />
          </Box>
          <Typography
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 11.5,
              fontWeight: 700,
              width: 38,
              textAlign: "right",
              color: b.color === BAR_COLORS.national ? "#5B6B85" : b.color,
            }}
          >
            {b.value}%
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const Section = ({ title, rows, defaultOpen = false }) => (
  <Accordion defaultExpanded={defaultOpen} disableGutters sx={{ mb: 1, "&:before": { display: "none" } }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      {rows.map((r) => (
        <ThreeWayRow key={r.name} {...r} />
      ))}
    </AccordionDetails>
  </Accordion>
);

// Looks up a district's own value for a PDF benchmark row (e.g. "Language",
// "Mathematics — Boys", "Language — Rural") against the matching per-district
// sheet data already loaded on the PARAKH page.
const buildDistrictRows = (rows, gradeKey, district, subjectData, genderData, locationData, managementData, socialGroupData) => {

  if (!district || district === "All") {
    return rows;
  }

  return rows.map((row) => {
    let districtValue = null;

    // "By Subject" rows are a plain subject name ("Language") and map
    // 1:1 to a "Grade X - Subject" column in PARAKH_Subject_Performance.
    if (SUBJECT_COLUMN_ALIASES[row.name]) {
      const col = `${GRADE_LABEL[gradeKey]} - ${SUBJECT_COLUMN_ALIASES[row.name]}`;
      const districtRow = subjectData.find((d) => d.District === district);
      if (districtRow && typeof districtRow[col] === "number") {
        districtValue = Math.round(districtRow[col] * 100);
      }
      return { ...row, district: districtValue };
    }

    // Gender/Location/Management/SocialGroup rows are named like
    // "Language — Boys". Our own Excel only has a combined (all-subjects)
    // Boys/Girls/etc average per district, not split by grade+subject, so
    // we show that combined district figure as the closest available
    // comparison point.
    const [, group] = row.name.split(" — ");

    const genderMap = { Boys: "Boys Avg (%)", Girls: "Girls Avg (%)" };
    const locationMap = { Rural: "Rural Avg (%)", Urban: "Urban Avg (%)" };
    const managementMap = {
      "State Govt.": "State Govt (%)",
      "Govt. Aided": "Govt Aided (%)",
      Private: "Private Recognised (%)",
      "Central Govt.": "Central Govt (%)",
    };
    const socialMap = { SC: "SC (%)", ST: "ST (%)", OBC: "OBC (%)", Others: "General/Others (%)" };

    const districtRowFrom = (dataset, colMap) => {
      const col = colMap[group];
      if (!col) return null;
      const dRow = dataset.find((d) => d.District === district);
      if (!dRow) return null;
      const match = Object.keys(dRow).find((k) => k.replace(/\s+/g, " ").trim() === col);
      return match && typeof dRow[match] === "number" ? Math.round(dRow[match] * 100) : null;
    };

    if (genderMap[group]) districtValue = districtRowFrom(genderData, genderMap);
    else if (locationMap[group]) districtValue = districtRowFrom(locationData, locationMap);
    else if (managementMap[group]) districtValue = districtRowFrom(managementData, managementMap);
    else if (socialMap[group]) districtValue = districtRowFrom(socialGroupData, socialMap);

    return { ...row, district: districtValue };
  });

};

const NationalBenchmarkPanel = ({
  district = "All",
  subjectData = [],
  genderData = [],
  locationData = [],
  managementData = [],
  socialGroupData = [],
}) => {
  const [grade, setGrade] = useState("G3");
  const raw = PARAKH_NATIONAL_BENCHMARKS[grade];

  const withDistrict = (rows) =>
    buildDistrictRows(rows, grade, district, subjectData, genderData, locationData, managementData, socialGroupData);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 4, border: "1px solid #E4E7F0" }} elevation={0}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1 }}>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, color: "#16233B" }}>
            🇮🇳 {district !== "All" ? `${district} vs Gujarat vs National` : "Gujarat vs National"} — PARAKH Rashtriya Sarvekshan 2024
          </Typography>

          <Chip
            label={`${raw.participation.schools.toLocaleString()} schools · ${raw.participation.students.toLocaleString()} students`}
            size="small"
            sx={{ bgcolor: "#F5F6FA", fontWeight: 600 }}
          />
        </Box>

        <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 2 }}>
          Source: NCERT / Ministry of Education (State Report) + this app's district-level Excel data.
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 2, ml: 1.5, flexWrap: "wrap" }}>
            {district !== "All" && (
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.6 }}>
                <Box sx={{ width: 10, height: 10, bgcolor: "#F0B429", borderRadius: "2px" }} /> {district}
              </Box>
            )}
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.6 }}>
              <Box sx={{ width: 10, height: 10, bgcolor: "#0F172A", borderRadius: "2px" }} /> Gujarat
            </Box>
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.6 }}>
              <Box sx={{ width: 10, height: 10, bgcolor: "#8B94A8", borderRadius: "2px" }} /> National
            </Box>
          </Box>
        </Typography>

        <Tabs value={grade} onChange={(e, v) => setGrade(v)} sx={{ mb: 2, borderBottom: "1px solid #E4E7F0" }}>
          <Tab label="Grade 3 (Foundational)" value="G3" sx={{ textTransform: "none", fontWeight: 600 }} />
          <Tab label="Grade 6 (Preparatory)" value="G6" sx={{ textTransform: "none", fontWeight: 600 }} />
          <Tab label="Grade 9 (Middle)" value="G9" sx={{ textTransform: "none", fontWeight: 600 }} />
        </Tabs>

        <Section title="📚 By Subject" rows={withDistrict(raw.subject)} defaultOpen />
        <Section title="🚻 By Gender" rows={withDistrict(raw.gender)} />
        <Section title="🏘️ By Location (Rural/Urban)" rows={withDistrict(raw.location)} />
        <Section title="🏫 By School Management Type" rows={withDistrict(raw.management)} />
        <Section title="🤝 By Social Group" rows={withDistrict(raw.socialGroup)} />
      </CardContent>
    </Card>
  );
};

export default NationalBenchmarkPanel;
