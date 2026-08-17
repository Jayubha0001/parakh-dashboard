import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
} from "@mui/material";

import RestartAltIcon from "@mui/icons-material/RestartAlt";

const FilterBar = ({
  district,
  setDistrict,
  stage,
  setStage,
  subject,
  setSubject,
  districts = [],
}) => {

  const handleClearFilters = () => {
    setDistrict("All");
    setStage("Overall");
    setSubject("Overall");
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 3,
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{ alignItems: "center" }}
      >

        {/* Filters */}

        <Grid size={{ xs: 12, md: 9 }}>

          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
          >

            <TextField
              select
              label="District"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              {districts.map((dist) => (
                <MenuItem
                  key={dist}
                  value={dist}
                >
                  {dist === "All"
                    ? "All Districts"
                    : dist}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="Overall">Overall</MenuItem>
              <MenuItem value="Foundational">Foundational</MenuItem>
              <MenuItem value="Preparatory">Preparatory</MenuItem>
              <MenuItem value="Middle">Middle</MenuItem>
            </TextField>

            <TextField
              select
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="Overall">Overall</MenuItem>
              <MenuItem value="Language">Language</MenuItem>
              <MenuItem value="Math">Mathematics</MenuItem>
            </TextField>

          </Box>

        </Grid>

        {/* Clear Button */}

        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >

          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={handleClearFilters}
            sx={{
              height: 56,
              minWidth: 180,
              borderRadius: 2,
              fontWeight: "bold",
            }}
          >
            Clear Filters
          </Button>

        </Grid>

      </Grid>

    </Paper>
  );
};

export default FilterBar;