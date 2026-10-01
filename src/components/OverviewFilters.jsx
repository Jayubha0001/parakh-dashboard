import { Box, MenuItem, TextField } from "@mui/material";
import { isPriorityDistrict } from "../utils/priorityDistricts";
import { useFeatureFlags } from "../config/FeatureFlagsContext";
import { ASSESSMENTS, periodOptionsFor, periodLabelFor, gradeOptionsFor } from "../utils/overviewConfig";

const C = { ink: "#16233B" };

// ---------------------------------------------------------------------
// Filter row (rendered inside the hero banner)
// ---------------------------------------------------------------------
const filterSx = {
  minWidth: { xs: "45%", sm: 150 },
  flex: { xs: "1 1 45%", md: "0 0 auto" },
  "& .MuiInputBase-root": {
    bgcolor: "#fff",
    borderRadius: 2,
    fontWeight: 600,
    fontSize: 14,
    color: C.ink,
  },
  "& .MuiInputLabel-root": { fontSize: 13 },
};

const OverviewFilters = ({
  year,
  setYear,
  assessment,
  setAssessment,
  grade,
  setGrade,
  district,
  setDistrict,
  districtOptions = [],
  satGrades = [],
}) => {
  const gradeOptions = gradeOptionsFor(assessment, satGrades);
  const { flags } = useFeatureFlags();
  const KEY = { Overall: "as_overall", "PGI-D": "as_pgi", PARAKH: "as_parakh", SAT: "as_sat" };
  const periods = periodOptionsFor(assessment);
  const yearLocked = periods.length <= 1;

  return (
    <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", alignItems: "center" }}>
      <TextField
        select
        size="small"
        label={periodLabelFor(assessment)}
        value={periods.includes(year) ? year : periods[0]}
        onChange={(e) => setYear(e.target.value)}
        disabled={yearLocked}
        sx={filterSx}
        helperText={null}
      >
        {periods.map((y) => (
          <MenuItem key={y} value={y}>
            {y}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Assessment"
        value={assessment}
        onChange={(e) => {
          setAssessment(e.target.value);
          setYear(periodOptionsFor(e.target.value)[0]);
          setGrade("All Grades");
        }}
        sx={filterSx}
      >
        {ASSESSMENTS.filter((a) => flags[KEY[a]] !== false).map((a) => (
          <MenuItem key={a} value={a}>
            {a}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Grade"
        value={gradeOptions.includes(grade) ? grade : "All Grades"}
        onChange={(e) => setGrade(e.target.value)}
        disabled={gradeOptions.length <= 1}
        sx={filterSx}
      >
        {gradeOptions.map((g) => (
          <MenuItem key={g} value={g}>
            {g}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="District"
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
        sx={{ ...filterSx, minWidth: { xs: "45%", sm: 170 } }}
      >
        <MenuItem value="All">All Districts</MenuItem>
        {districtOptions.map((d) => (
          <MenuItem key={d} value={d}>
            {d}
            {isPriorityDistrict(d) ? " ⭐" : ""}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};


export default OverviewFilters;
