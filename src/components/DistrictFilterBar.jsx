import { useState } from "react";
import { Paper, TextField, MenuItem, Button, Box, ToggleButton } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import GujaratDistrictMap from "./GujaratDistrictMap";

// A lightweight District-only filter (District dropdown) for pages that
// show one row per district (PARAKH, PGI 2.0, Comparison) but don't have a
// Stage/Subject axis the way the home Dashboard does. Selecting a district
// applies immediately — no separate "Apply" click needed.
//
// An optional map view sits behind the "Map" toggle: clicking a district
// on the map sets the exact same `district` state as the dropdown, so it
// filters every chart/table on the page the same way the dropdown always
// has. Pass `mapData` (an optional { [districtName]: number } lookup,
// e.g. PGI % achieved per district) to shade the map by that metric —
// otherwise the map still works, just without the shading.
const DistrictFilterBar = ({ district, setDistrict, districts = [], mapData = null, mapValueSuffix = "%" }) => {
  const [showMap, setShowMap] = useState(false);

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: showMap ? 0 : 2,
          borderRadius: showMap ? "12px 12px 0 0" : 3,
          border: "1px solid #E4E7F0",
          borderBottom: showMap ? "none" : "1px solid #E4E7F0",
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

        <ToggleButton
          value="map"
          selected={showMap}
          onChange={() => setShowMap((v) => !v)}
          size="small"
          sx={{ textTransform: "none", fontWeight: 600, gap: 0.75, px: 1.5 }}
        >
          <MapOutlinedIcon fontSize="small" />
          {showMap ? "Hide map" : "Select on map"}
        </ToggleButton>
      </Paper>

      {showMap && (
        <Box sx={{ mb: 2 }}>
          <GujaratDistrictMap
            district={district}
            setDistrict={setDistrict}
            districts={districts}
            dataByDistrict={mapData}
            valueSuffix={mapValueSuffix}
          />
        </Box>
      )}
    </>
  );
};

export default DistrictFilterBar;
