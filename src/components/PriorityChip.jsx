import { Chip } from "@mui/material";
import { isPriorityDistrict } from "../utils/priorityDistricts";

// Small "⭐ Priority" tag shown next to a district name wherever it
// appears in a table/list, if that district is one of the 11 priority
// (Aspirational) districts.
const PriorityChip = ({ district }) => {
  if (!isPriorityDistrict(district)) return null;

  return (
    <Chip
      label="⭐ Priority"
      size="small"
      sx={{
        ml: 1,
        height: 18,
        fontSize: 10,
        fontWeight: 700,
        bgcolor: "#FFF4D6",
        color: "#8A6200",
        "& .MuiChip-label": { px: 0.8 },
      }}
    />
  );
};

export default PriorityChip;
