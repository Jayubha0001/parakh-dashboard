import { Card, CardContent, Typography, Grid, LinearProgress, Box } from "@mui/material";
import { gradeColor } from "./PGIHeader";

const shortenDomain = (name = "") => name.split(" - ")[0].replace("Domain ", "D");

const PGIDomainCards = ({ domains = [], title = "📚 Domain-wise Score — Gujarat State (2024-25)" }) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: "#1E3A8A" }}>
        {title}
      </Typography>

      <Grid container spacing={3}>
        {domains.map((d, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={i}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
              <CardContent>
                <Typography
                  fontSize={13}
                  fontWeight="bold"
                  color="text.secondary"
                  sx={{ minHeight: 36 }}
                >
                  {shortenDomain(d.domain)}
                </Typography>

                <Typography variant="h5" fontWeight="bold" mt={1} sx={{ color: gradeColor(d.grade) }}>
                  {d.score.toFixed(1)}
                  <Typography component="span" fontSize={14} color="text.secondary">
                    {" "}/ {d.maxWeight}
                  </Typography>
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={Math.min(d.percentAchieved, 100)}
                  sx={{
                    mt: 1,
                    mb: 1,
                    height: 8,
                    borderRadius: 5,
                    bgcolor: "#eee",
                    "& .MuiLinearProgress-bar": { bgcolor: gradeColor(d.grade) },
                  }}
                />

                <Typography fontSize={12} fontWeight="bold" sx={{ color: gradeColor(d.grade) }}>
                  {d.percentAchieved.toFixed(1)}% · {d.grade}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PGIDomainCards;
