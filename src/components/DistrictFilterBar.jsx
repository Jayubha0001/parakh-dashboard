import { Paper, TextField, MenuItem, Button, Box, ToggleButton } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StarIcon from "@mui/icons-material/Star";
import { isPriorityDistrict } from "../utils/priorityDistricts";

// A lightweight District-only filter (District dropdown) for pages that
// show one row per district (PARAKH, PGI 2.0, Comparison) but don't have a
// Stage/Subject axis the way the home Dashboard does. Selecting a district
// applies immediately — no separate "Apply" click needed.
//
// Map-based district selection now lives in the page's Executive Snapshot
// panel (GujaratBubbleMap), so this bar no longer duplicates it with its
// own "Select on map" toggle.
//
// Pass `priorityOnly`/`onPriorityOnlyChange` (lifted state from the page)
// to show a "⭐ Priority Districts Only" toggle that narrows every list on
// the page down to the state's 10 focus districts.
const DistrictFilterBar = ({
  district,
  setDistrict,
  districts = [],
  priorityOnly = null,
  onPriorityOnlyChange = null,
}) => {
  const sortedDistricts =
    districts.length <= 1
      ? districts
      : [
          districts[0], // "All"
          ...[...districts.slice(1)].sort(
            (a, b) => Number(isPriorityDistrict(b)) - Number(isPriorityDistrict(a))
          ),
        ];

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2,
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
          {sortedDistricts.map((d) => (
            <MenuItem key={d} value={d}>
              {d === "All" ? "All Districts" : d}
              {isPriorityDistrict(d) ? " ⭐" : ""}
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

        {onPriorityOnlyChange && (
          <ToggleButton
            value="priority"
            selected={priorityOnly}
            onChange={() => onPriorityOnlyChange(!priorityOnly)}
            size="small"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              gap: 0.6,
              px: 1.5,
              color: priorityOnly ? "#8A6200" : undefined,
              borderColor: priorityOnly ? "#F0B429" : undefined,
              "&.Mui-selected": { bgcolor: "#FFF4D6", "&:hover": { bgcolor: "#FDEBB8" } },
            }}
          >
            <StarIcon fontSize="small" sx={{ color: priorityOnly ? "#F0B429" : undefined }} />
            Priority Districts Only
          </ToggleButton>
        )}
      </Paper>
    </>
  );
};

export default DistrictFilterBar;
