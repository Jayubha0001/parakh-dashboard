import { useEffect, useState } from "react";
import { Paper, TextField, MenuItem, Button, Box } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

// A lightweight District-only filter (District dropdown + "Apply Filters"
// button) for pages that show one row per district (PARAKH, PGI 2.0,
// Comparison) but don't have a Stage/Subject axis the way the home
// Dashboard does.
const DistrictFilterBar = ({ district, setDistrict, districts = [] }) => {
  const [pending, setPending] = useState(district);

  // Keep the dropdown in sync if the district is changed elsewhere
  // (e.g. cleared programmatically).
  useEffect(() => {
    setPending(district);
  }, [district]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 3,
        border: "1px solid #E4E7F0",
        display: "flex",
        gap: 2,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <TextField
        select
        label="District"
        value={pending}
        onChange={(e) => setPending(e.target.value)}
        size="small"
        sx={{ minWidth: 220 }}
      >
        {districts.map((d) => (
          <MenuItem key={d} value={d}>
            {d === "All" ? "All Districts" : d}
          </MenuItem>
        ))}
      </TextField>

      <Button
        variant="contained"
        startIcon={<FilterAltIcon />}
        onClick={() => setDistrict(pending)}
        sx={{
          bgcolor: "#0F172A",
          "&:hover": { bgcolor: "#1E3A5F" },
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 2,
        }}
      >
        Apply Filters
      </Button>

      {district !== "All" && (
        <Button
          variant="text"
          startIcon={<RestartAltIcon />}
          onClick={() => {
            setPending("All");
            setDistrict("All");
          }}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Clear
        </Button>
      )}

      <Box sx={{ flex: 1 }} />
    </Paper>
  );
};

export default DistrictFilterBar;
