import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

import { PARAKH_NATIONAL_BENCHMARKS } from "../constants/parakhNationalBenchmarks";

// Maps a PDF benchmark row's grade+subject name to the exact column name
// used in the "PARAKH_Subject_Performance" sheet, so a selected district's
// own score can be looked up and shown alongside Gujarat/National.
const GRADE_LABEL = { G3: "Grade 3", G6: "Grade 6", G9: "Grade 9" };
const GRADE_SHORT = { G3: "G3", G6: "G6", G9: "G9" };
const GRADES = ["G3", "G6", "G9"];

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

// Looks up a district's own value for a PDF benchmark row (e.g. "Language",
// "Mathematics — Boys", "Language — Rural") against the matching per-district
// sheet data already loaded on the PARAKH page. When no single district is
// picked but a `priorityDistricts` list is given (the "Priority Districts
// Only" toggle), the same column is instead AVERAGED across those 10
// districts, so the extra bar reads as "how are our focus districts doing"
// rather than one specific place.
const buildDistrictRows = (rows, gradeKey, district, subjectData, genderData, locationData, managementData, socialGroupData, priorityDistricts = null) => {
  const usePriorityAvg = (!district || district === "All") && priorityDistricts && priorityDistricts.length > 0;

  if (!district || district === "All") {
    if (!usePriorityAvg) return rows;
  }

  const avgAcross = (dataset, col) => {
    const vals = dataset
      .filter((d) => priorityDistricts.includes(d.District))
      .map((d) => d[col])
      .filter((v) => typeof v === "number");
    if (!vals.length) return null;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100);
  };

  return rows.map((row) => {
    let districtValue = null;

    // "By Subject" rows are a plain subject name ("Language") and map
    // 1:1 to a "Grade X - Subject" column in PARAKH_Subject_Performance.
    if (SUBJECT_COLUMN_ALIASES[row.name]) {
      const col = `${GRADE_LABEL[gradeKey]} - ${SUBJECT_COLUMN_ALIASES[row.name]}`;
      if (usePriorityAvg) {
        districtValue = avgAcross(subjectData, col);
      } else {
        const districtRow = subjectData.find((d) => d.District === district);
        if (districtRow && typeof districtRow[col] === "number") {
          districtValue = Math.round(districtRow[col] * 100);
        }
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

    const resolveCol = (dataset, colMap) => {
      const col = colMap[group];
      if (!col) return null;
      // Column names in the sheet can have slightly different whitespace
      // than the literal map value, so match on a normalised key —
      // needed for both the single-district lookup and the averaging path.
      const sample = dataset[0] || {};
      const match = Object.keys(sample).find((k) => k.replace(/\s+/g, " ").trim() === col);
      return match || null;
    };

    const districtRowFrom = (dataset, colMap) => {
      const col = colMap[group];
      if (!col) return null;
      const dRow = dataset.find((d) => d.District === district);
      if (!dRow) return null;
      const match = Object.keys(dRow).find((k) => k.replace(/\s+/g, " ").trim() === col);
      return match && typeof dRow[match] === "number" ? Math.round(dRow[match] * 100) : null;
    };

    if (usePriorityAvg) {
      if (genderMap[group]) districtValue = avgAcross(genderData, resolveCol(genderData, genderMap));
      else if (locationMap[group]) districtValue = avgAcross(locationData, resolveCol(locationData, locationMap));
      else if (managementMap[group]) districtValue = avgAcross(managementData, resolveCol(managementData, managementMap));
      else if (socialMap[group]) districtValue = avgAcross(socialGroupData, resolveCol(socialGroupData, socialMap));
    } else {
      if (genderMap[group]) districtValue = districtRowFrom(genderData, genderMap);
      else if (locationMap[group]) districtValue = districtRowFrom(locationData, locationMap);
      else if (managementMap[group]) districtValue = districtRowFrom(managementData, managementMap);
      else if (socialMap[group]) districtValue = districtRowFrom(socialGroupData, socialMap);
    }

    return { ...row, district: districtValue };
  });
};

// Same three-way comparison (District / Gujarat / National) as before, but
// merged across all three grades into a single lookup keyed by row name, so
// each subject/group shows one combined chart instead of needing a grade
// tab to switch between three separate copies of the same row.
const combineAcrossGrades = (sectionKey, district, subjectData, genderData, locationData, managementData, socialGroupData, priorityDistricts = null) => {
  const byName = new Map();

  GRADES.forEach((gradeKey) => {
    const raw = PARAKH_NATIONAL_BENCHMARKS[gradeKey][sectionKey] || [];
    const enriched = buildDistrictRows(raw, gradeKey, district, subjectData, genderData, locationData, managementData, socialGroupData, priorityDistricts);

    enriched.forEach((row) => {
      if (!byName.has(row.name)) byName.set(row.name, { name: row.name, points: [] });
      byName.get(row.name).points.push({
        grade: GRADE_SHORT[gradeKey],
        district: row.district ?? null,
        Gujarat: row.state,
        National: row.national,
      });
    });
  });

  return [...byName.values()];
};

// One standing (vertical) bar chart per subject/group, grades along the
// X-axis, so all three grades are visible together without a tab click.
const BenchmarkChart = ({ item, showDistrict, districtBarLabel = "District" }) => {
  const data = item.points.map((p) => ({
    grade: p.grade,
    ...(showDistrict && p.district != null ? { [districtBarLabel]: p.district } : {}),
    Gujarat: p.Gujarat,
    National: p.National,
  }));

  return (
    <Box sx={{ height: 200 }}>
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, mb: 0.5, textAlign: "center" }}>{item.name}</Typography>
      <ResponsiveContainer width="100%" height="88%">
        <BarChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
          <RechartsTooltip formatter={(value) => `${value}%`} />
          {showDistrict && <Bar dataKey={districtBarLabel} fill={BAR_COLORS.district} radius={[3, 3, 0, 0]} barSize={14} />}
          <Bar dataKey="Gujarat" fill={BAR_COLORS.state} radius={[3, 3, 0, 0]} barSize={14} />
          <Bar dataKey="National" fill={BAR_COLORS.national} radius={[3, 3, 0, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

const CategoryChartGrid = ({ items, showDistrict, districtBarLabel }) => (
  <Grid container spacing={2}>
    {items.map((item) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.name}>
        <BenchmarkChart item={item} showDistrict={showDistrict} districtBarLabel={districtBarLabel} />
      </Grid>
    ))}
  </Grid>
);

const CATEGORY_OPTIONS = [
  { key: "subject", label: "📊 By Subject" },
  { key: "gender", label: "👥 By Gender" },
  { key: "location", label: "🏡 By Location (Rural/Urban)" },
  { key: "management", label: "🏫 By School Management Type" },
  { key: "socialGroup", label: "🤝 By Social Group" },
];

const NationalBenchmarkPanel = ({
  district = "All",
  subjectData = [],
  genderData = [],
  locationData = [],
  managementData = [],
  socialGroupData = [],
  priorityOnly = false,
  priorityDistricts = [],
}) => {
  const usePriorityAvg = district === "All" && priorityOnly && priorityDistricts.length > 0;
  const showDistrict = district !== "All" || usePriorityAvg;
  const districtBarLabel = district !== "All" ? "District" : "Priority Avg";
  const [category, setCategory] = useState("subject");

  const combine = (sectionKey) =>
    combineAcrossGrades(
      sectionKey,
      district,
      subjectData,
      genderData,
      locationData,
      managementData,
      socialGroupData,
      usePriorityAvg ? priorityDistricts : null
    );

  const totalSchools = GRADES.reduce((s, g) => s + PARAKH_NATIONAL_BENCHMARKS[g].participation.schools, 0);
  const totalStudents = GRADES.reduce((s, g) => s + PARAKH_NATIONAL_BENCHMARKS[g].participation.students, 0);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 2.5, border: "1px solid #E4E7F0" }} elevation={0}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1 }}>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, color: "#16233B" }}>
            🇮🇳 {district !== "All" ? `${district} vs Gujarat vs National` : usePriorityAvg ? "Priority Districts Avg vs Gujarat vs National" : "Gujarat vs National"} — PARAKH Rashtriya Sarvekshan 2024
          </Typography>

          <Chip
            label={`${totalSchools.toLocaleString()} schools · ${totalStudents.toLocaleString()} students · Grades 3, 6 & 9`}
            size="small"
            sx={{ bgcolor: "#F5F6FA", fontWeight: 600 }}
          />
        </Box>

        <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 2 }}>
          Source: NCERT / Ministry of Education (State Report) + this app's district-level Excel data. Each chart below
          shows Grade 3, 6 and 9 side by side, so all three stages are visible at once — no grade tab needed.
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 2, ml: 1.5, flexWrap: "wrap" }}>
            {showDistrict && (
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.6 }}>
                <Box sx={{ width: 10, height: 10, bgcolor: "#F0B429", borderRadius: "2px" }} />{" "}
                {district !== "All" ? district : `Priority Avg (${priorityDistricts.length})`}
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

        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1.5 }}>View</Typography>
        {CATEGORY_OPTIONS.map((o) => (
          <Accordion
            key={o.key}
            expanded={category === o.key}
            onChange={(_, isExp) => setCategory(isExp ? o.key : category)}
            disableGutters
            elevation={0}
            sx={{
              mb: 1.25,
              border: "1px solid #E4E7F0",
              borderRadius: "12px !important",
              "&:before": { display: "none" },
              overflow: "hidden",
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5, py: 0.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#16233B" }}>{o.label}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2.5, pb: 2.5 }}>
              <CategoryChartGrid items={combine(o.key)} showDistrict={showDistrict} districtBarLabel={districtBarLabel} />
            </AccordionDetails>
          </Accordion>
        ))}
      </CardContent>
    </Card>
  );
};

export default NationalBenchmarkPanel;
