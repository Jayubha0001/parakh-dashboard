import { Card, CardContent, Typography, Grid } from "@mui/material";

const StateSummary = ({
  averageScore,
  totalDistricts,
  topDistrict,
  lowestDistrict,
}) => {

  const grade =
    averageScore >= 90
      ? "A+"
      : averageScore >= 80
      ? "A"
      : averageScore >= 70
      ? "B+"
      : averageScore >= 60
      ? "B"
      : averageScore >= 50
      ? "C"
      : "D";

  return (
    <Card
      sx={{
        mt: 4,
        borderRadius: 3,
      }}
    >
      <CardContent>

        <Typography
          variant="h6"
          fontWeight="bold"
          mb={3}
        >
          Gujarat State Summary
        </Typography>

        <Grid container spacing={3}>

          <Grid item xs={12} md={4}>
            <Typography color="text.secondary">
              Overall Score
            </Typography>

            <Typography variant="h5">
              {averageScore}%
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography color="text.secondary">
              State Grade
            </Typography>

            <Typography variant="h5">
              {grade}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography color="text.secondary">
              Total Districts
            </Typography>

            <Typography variant="h5">
              {totalDistricts}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography color="text.secondary">
              Best District
            </Typography>

            <Typography variant="h6">
              {topDistrict?.District}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography color="text.secondary">
              Lowest District
            </Typography>

            <Typography variant="h6">
              {lowestDistrict?.District}
            </Typography>
          </Grid>

        </Grid>

      </CardContent>
    </Card>
  );
};

export default StateSummary;