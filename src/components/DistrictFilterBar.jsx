import { Paper, TextField, MenuItem, Button, Box } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

// A lightweight District-only filter (District dropdown) for pages that
// show one row per district (PARAKH, PGI 2.0, Comparison) but don't have a
// Stage/Subject axis the way the home Dashboard does. Selecting a district
// applies immediately — no separate "Apply" click needed.
const DistrictFilterBar = ({ district, setDistrict, districts = [] }) => {
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
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
        size="small"
        sx={{ minWidth: 220 }}
      >
        {districts.map((d) => (
          <MenuItem key={d} value={d}>
            {d === "All" ? "All Districts" : d}
          </MenuItem>
        ))}
      </TextField>

      {district !== "All" && (
        <Button
          variant="text"
          startIcon={<RestartAltIcon />}
          onClick={() => setDistrict("All")}
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
