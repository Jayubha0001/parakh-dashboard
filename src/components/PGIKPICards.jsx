import { Card, CardContent, Typography, Grid } from "@mui/material";

const PGIKPICards = ({ overall, totalDistricts, topDistrict, lowestDistrict }) => {
  const cards = [
    {
      label: "🏛️ State Overall Score",
      value: `${overall?.score?.toFixed(1) ?? "-"}`,
      sub: `out of ${overall?.maxWeight ?? 1000}`,
      color: "#6A1B9A",
    },
    {
      label: "📊 % Achieved",
      value: `${overall?.percentAchieved?.toFixed(1) ?? 0}%`,
      sub: overall?.grade || "-",
      color: "#2E7D32",
    },
    {
      label: "🌍 Districts Assessed",
      value: totalDistricts ?? 0,
      sub: "Districts (PGI-D 2.0)",
      color: "#1976D2",
    },
    {
      label: "🏆 Top District",
      value: topDistrict?.District || "-",
      sub: `${topDistrict?.PercentAchieved?.toFixed(1) ?? 0}%`,
      color: "#F9A825",
    },
    {
      label: "📉 Needs Support",
      value: lowestDistrict?.District || "-",
      sub: `${lowestDistrict?.PercentAchieved?.toFixed(1) ?? 0}%`,
      color: "#D32F2F",
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((c, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
          <Card
            sx={{
              borderLeft: `6px solid ${c.color}`,
              borderRadius: 3,
              boxShadow: 4,
              transition: "0.3s",
              height: "100%",
              "&:hover": { transform: "translateY(-5px)", boxShadow: 8 },
            }}
          >
            <CardContent>
              <Typography fontSize={13} color="text.secondary">
                {c.label}
              </Typography>

              <Typography
                variant="h5"
                fontWeight="bold"
                mt={1}
                noWrap
                sx={{ color: c.color }}
              >
                {c.value}
              </Typography>

              <Typography color="text.secondary" fontSize={13}>
                {c.sub}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default PGIKPICards;
