import { useEffect, useMemo, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Chip,
} from "@mui/material";

import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import Loading from "../components/Loading";

import {
  loadExcel,
  getSheetData,
  getDistrictPGIRanking,
} from "../services/dataService";

const DistrictProfile = () => {
  const [loading, setLoading] = useState(true);

  const [district, setDistrict] = useState("");

  const [parakhData, setParakhData] = useState([]);

  const [pgiData, setPgiData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const workbook = await loadExcel();

        setParakhData(
          getSheetData(workbook, "Dashboard_PARAKH")
        );

        setPgiData(
          getDistrictPGIRanking(workbook)
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const districts = useMemo(() => {
    return parakhData
      .map((d) => d.District)
      .sort();
  }, [parakhData]);

  const selectedDistrict = district || districts[0] || "";

  const parakh = parakhData.find(
    (x) => x.District === selectedDistrict
  );

  const pgi = pgiData.find(
    (x) => x.District === selectedDistrict
  );

  if (loading) return <Loading />;

  return (
    <DashboardLayout>

      <Header />

      <Grid container spacing={3}> 

              {/* District Selector */}

        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>Select District</InputLabel>

                <Select
                  value={selectedDistrict}
                  label="Select District"
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  {districts.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* PARAKH Overall */}

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderLeft: "6px solid #1976D2",
              borderRadius: 3,
              boxShadow: 4,
            }}
          >
            <CardContent>

              <Typography color="text.secondary">
                PARAKH Overall
              </Typography>

              <Typography
                variant="h3"
                fontWeight="bold"
                color="primary"
              >
                {parakh
                  ? (parakh.Overall * 100).toFixed(1)
                  : 0}
                %
              </Typography>

              <Chip
                color="primary"
                label="Assessment Score"
                sx={{ mt: 2 }}
              />

            </CardContent>
          </Card>
        </Grid>

        {/* PGI Score */}

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderLeft: "6px solid #2E7D32",
              borderRadius: 3,
              boxShadow: 4,
            }}
          >
            <CardContent>

              <Typography color="text.secondary">
                PGI Score
              </Typography>

              <Typography
                variant="h3"
                fontWeight="bold"
                color="success.main"
              >
                {pgi?.Score || 0}
              </Typography>

              <Chip
                color="success"
                label="PGI 2.0"
                sx={{ mt: 2 }}
              />

            </CardContent>
          </Card>
        </Grid>

        {/* Grade */}

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderLeft: "6px solid #F9A825",
              borderRadius: 3,
              boxShadow: 4,
            }}
          >
            <CardContent>

              <Typography color="text.secondary">
                PGI Grade
              </Typography>

              <Typography
                variant="h2"
                fontWeight="bold"
              >
                {pgi?.Grade || "-"}
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        {/* District */}

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderLeft: "6px solid #8E24AA",
              borderRadius: 3,
              boxShadow: 4,
            }}
          >
            <CardContent>

              <Typography color="text.secondary">
                Selected District
              </Typography>

              <Typography
                variant="h5"
                fontWeight="bold"
              >
                {district}
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        {/* Stage-wise Performance */}

        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>

              <Typography
                variant="h6"
                fontWeight="bold"
                mb={3}
              >
                Stage-wise Performance
              </Typography>

              <Grid container spacing={3}>

                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      bgcolor: "#E3F2FD",
                      textAlign: "center",
                      p: 2,
                    }}
                  >
                    <Typography variant="subtitle1">
                      Foundational
                    </Typography>

                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      color="primary"
                    >
                      {parakh
                        ? (
                            parakh.Foundational * 100
                          ).toFixed(1)
                        : 0}
                      %
                    </Typography>

                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      bgcolor: "#E8F5E9",
                      textAlign: "center",
                      p: 2,
                    }}
                  >
                    <Typography variant="subtitle1">
                      Preparatory
                    </Typography>

                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {parakh
                        ? (
                            parakh.Preparatory * 100
                          ).toFixed(1)
                        : 0}
                      %
                    </Typography>

                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      bgcolor: "#FFF3E0",
                      textAlign: "center",
                      p: 2,
                    }}
                  >
                    <Typography variant="subtitle1">
                      Middle
                    </Typography>

                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      {parakh
                        ? (
                            parakh.Middle * 100
                          ).toFixed(1)
                        : 0}
                      %
                    </Typography>

                  </Card>
                </Grid>

              </Grid>

            </CardContent>
          </Card>
        </Grid>
                {/* Performance Summary */}

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent>

              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
              >
                📈 Performance Summary
              </Typography>

              <Box mt={2}>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Typography>Foundational</Typography>

                  <Typography fontWeight="bold">
                    {parakh
                      ? (parakh.Foundational * 100).toFixed(1)
                      : 0}
                    %
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Typography>Preparatory</Typography>

                  <Typography fontWeight="bold">
                    {parakh
                      ? (parakh.Preparatory * 100).toFixed(1)
                      : 0}
                    %
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Typography>Middle</Typography>

                  <Typography fontWeight="bold">
                    {parakh
                      ? (parakh.Middle * 100).toFixed(1)
                      : 0}
                    %
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                >
                  <Typography>Overall</Typography>

                  <Typography
                    color="primary"
                    fontWeight="bold"
                  >
                    {parakh
                      ? (parakh.Overall * 100).toFixed(1)
                      : 0}
                    %
                  </Typography>
                </Box>

              </Box>

            </CardContent>
          </Card>
        </Grid>

        {/* Recommendation */}

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent>

              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
              >
                💡 Recommendation
              </Typography>

              <Typography mt={2}>
                • Improve foundational literacy through
                structured classroom intervention.
              </Typography>

              <Typography mt={2}>
                • Conduct monthly assessment reviews.
              </Typography>

              <Typography mt={2}>
                • Strengthen teacher mentoring for
                Mathematics and Language.
              </Typography>

              <Typography mt={2}>
                • Increase classroom observation in
                low-performing schools.
              </Typography>

              <Typography mt={2}>
                • Monitor district progress using
                PARAKH and PGI dashboards.
              </Typography>

            </CardContent>
          </Card>
        </Grid>

      </Grid>

</DashboardLayout>
);

};

export default DistrictProfile;
