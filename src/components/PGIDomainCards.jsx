import { Card, CardContent, Typography, Grid, LinearProgress, Box, Divider } from "@mui/material";
import { gradeColor } from "./PGIHeader";

const shortenDomain = (name = "") => name.split(" - ")[0].replace("Domain ", "D");

// One accent colour per domain slot (not tied to grade) so each of the 6
// domain cards is visually distinct at a glance, the way a real dashboard
// panel set would be colour-keyed, rather than 6 identical white cards
// that only differ in their numbers.
const DOMAIN_ACCENTS = ["#1976D2", "#8E24AA", "#00897B", "#F0B429", "#D32F2F", "#5B6B85"];

// domains2/label/label2 are optional — when passed, each card shows BOTH
// years' scores stacked inside the same card (with a Δ), instead of two
// separate rows of cards for the two years, which read as duplicated
// domain lists at a glance.
//
// `compact` swaps the full card grid (progress bars, /max weight, grade
// chips — a lot of vertical space) for a single row of small tiles with
// just the % and the year-over-year delta. Use this when the section is
// living inside another card (e.g. folded into the District Snapshot
// panel) rather than standing on its own on the page.
const PGIDomainCards = ({
  domains = [],
  domains2 = null,
  label = "24-25",
  label2 = "25-26",
  title = "📚 Domain-wise Score — Gujarat State (2024-25)",
  compact = false,
}) => {
  const byDomain2 = domains2 ? new Map(domains2.map((d) => [d.domain, d])) : null;

  if (compact) {
    return (
      <Box>
        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#16233B", mb: 1 }}>
          {title}
        </Typography>
        <Grid container spacing={1}>
          {domains.map((d, i) => {
            const d2 = byDomain2?.get(d.domain);
            const delta = d2 ? Math.round((d2.percentAchieved - d.percentAchieved) * 10) / 10 : null;
            const accent = DOMAIN_ACCENTS[i % DOMAIN_ACCENTS.length];
            const shortLabel = shortenDomain(d.domain);
            const domainNo = shortLabel.match(/^D\d+/)?.[0] || `D${i + 1}`;
            const domainName = shortLabel.replace(/^D\d+:\s*/, "");

            return (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={i}>
                <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: "#F5F6FA", borderLeft: `3px solid ${accent}`, height: "100%" }}>
                  <Typography
                    sx={{ fontSize: 10, fontWeight: 700, color: "#5B6B85", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    title={domainName}
                  >
                    {domainNo} · {domainName}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mt: 0.3 }}>
                    <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, fontWeight: 700, color: "#16233B" }}>
                      {d.percentAchieved.toFixed(0)}%
                    </Typography>
                    {d2 && (
                      <>
                        <Typography sx={{ fontSize: 10, color: "#9AA5B1" }}>→</Typography>
                        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, fontWeight: 700, color: accent }}>
                          {d2.percentAchieved.toFixed(0)}%
                        </Typography>
                      </>
                    )}
                  </Box>
                  {delta != null && (
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: delta >= 0 ? "#2E7D32" : "#D32F2F" }}>
                      {delta >= 0 ? "▲" : "▼"} {delta >= 0 ? "+" : ""}
                      {delta}pp
                    </Typography>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2.5 }}>
      <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: "#1E3A8A" }}>
        {title}
      </Typography>

      <Grid container spacing={2}>
        {domains.map((d, i) => {
          const d2 = byDomain2?.get(d.domain);
          const delta = d2 ? Math.round((d2.percentAchieved - d.percentAchieved) * 10) / 10 : null;
          const accent = DOMAIN_ACCENTS[i % DOMAIN_ACCENTS.length];
          const shortLabel = shortenDomain(d.domain);
          const domainNo = shortLabel.match(/^D\d+/)?.[0] || `D${i + 1}`;
          const domainName = shortLabel.replace(/^D\d+:\s*/, "");

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={i}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  height: "100%",
                  borderTop: `4px solid ${accent}`,
                  transition: "transform 0.15s, box-shadow 0.15s",
                  "&:hover": { transform: "translateY(-3px)", boxShadow: 6 },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minHeight: 44, mb: 0.5 }}>
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: accent,
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: '"IBM Plex Mono", monospace',
                      }}
                    >
                      {domainNo}
                    </Box>
                    <Typography fontSize={12.5} fontWeight={700} color="text.secondary" sx={{ lineHeight: 1.25 }}>
                      {domainName}
                    </Typography>
                  </Box>

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
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, flexWrap: "wrap" }}>
                        <Typography fontSize={12} fontWeight="bold" sx={{ color: gradeColor(d2.grade) }}>
                          {d2.percentAchieved.toFixed(1)}% · {d2.grade}
                        </Typography>
                        {delta != null && (
                          <Box
                            sx={{
                              fontSize: 11,
                              fontWeight: 700,
                              fontFamily: '"IBM Plex Mono", monospace',
                              px: 0.8,
                              py: 0.1,
                              borderRadius: 5,
                              bgcolor: delta >= 0 ? "#E8F5E9" : "#FDECEA",
                              color: delta >= 0 ? "#2E7D32" : "#D32F2F",
                            }}
                          >
                            {delta >= 0 ? "▲" : "▼"} {delta >= 0 ? "+" : ""}
                            {delta}pp
                          </Box>
                        )}
                      </Box>
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
