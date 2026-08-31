import { Card, CardContent, Typography, Grid, LinearProgress, Box, Divider } from "@mui/material";
import { gradeColor } from "./PGIHeader";

const shortenDomain = (name = "") => name.split(" - ")[0].replace("Domain ", "D");

// domains2/label/label2 are optional — when passed, each card shows BOTH
// years' scores stacked inside the same card (with a Δ), instead of two
// separate rows of cards for the two years, which read as duplicated
// domain lists at a glance.
const PGIDomainCards = ({
  domains = [],
  domains2 = null,
  label = "24-25",
  label2 = "25-26",
  title = "📚 Domain-wise Score — Gujarat State (2024-25)",
}) => {
  const byDomain2 = domains2 ? new Map(domains2.map((d) => [d.domain, d])) : null;

  return (
    <Box sx={{ mt: 2.5 }}>
      <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: "#1E3A8A" }}>
        {title}
      </Typography>

      <Grid container spacing={2}>
        {domains.map((d, i) => {
          const d2 = byDomain2?.get(d.domain);
          const delta = d2 ? Math.round((d2.percentAchieved - d.percentAchieved) * 10) / 10 : null;

          return (
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

                  {domains2 && (
                    <Typography fontSize={10.5} fontWeight={700} color="text.secondary" sx={{ mt: 0.5 }}>
                      {label}
                    </Typography>
                  )}
                  <Typography variant="h5" fontWeight="bold" sx={{ color: gradeColor(d.grade), lineHeight: 1.2, mt: domains2 ? 0 : 1 }}>
                    {d.score.toFixed(1)}
                    <Typography component="span" fontSize={14} color="text.secondary">
                      {" "}/ {d.maxWeight}
                    </Typography>
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(d.percentAchieved, 100)}
                    sx={{
                      mt: 0.5,
                      mb: 0.5,
                      height: 8,
                      borderRadius: 5,
                      bgcolor: "#eee",
                      "& .MuiLinearProgress-bar": { bgcolor: gradeColor(d.grade) },
                    }}
                  />
                  <Typography fontSize={12} fontWeight="bold" sx={{ color: gradeColor(d.grade) }}>
                    {d.percentAchieved.toFixed(1)}% · {d.grade}
                  </Typography>

                  {d2 && (
                    <>
                      <Divider sx={{ my: 1 }} />

                      <Typography fontSize={10.5} fontWeight={700} color="text.secondary">
                        {label2}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: gradeColor(d2.grade), lineHeight: 1.2 }}>
                        {d2.score.toFixed(1)}
                        <Typography component="span" fontSize={14} color="text.secondary">
                          {" "}/ {d2.maxWeight}
                        </Typography>
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(d2.percentAchieved, 100)}
                        sx={{
                          mt: 0.5,
                          mb: 0.5,
                          height: 8,
                          borderRadius: 5,
                          bgcolor: "#eee",
                          "& .MuiLinearProgress-bar": { bgcolor: gradeColor(d2.grade) },
                        }}
                      />
                      <Typography
                        fontSize={12}
                        fontWeight="bold"
                        sx={{ color: delta == null ? gradeColor(d2.grade) : delta >= 0 ? "#2E7D32" : "#D32F2F" }}
                      >
                        {d2.percentAchieved.toFixed(1)}% · {d2.grade}
                        {delta != null && ` (${delta >= 0 ? "+" : ""}${delta}pp)`}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default PGIDomainCards;
