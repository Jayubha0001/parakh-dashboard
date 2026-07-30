import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  MenuItem,
  Chip,
} from "@mui/material";

const scoreColor = (pct) => {
  if (pct >= 71) return "#2E7D32";
  if (pct >= 51) return "#66BB6A";
  if (pct >= 31) return "#FB8C00";
  return "#D32F2F";
};

// Groups the 70 raw indicators by their Category, and pairs each group
// with its subtotal (from domainSummary) so the accordion header can show
// "Category X — 126.6 / 290" without a second data source.
const groupIndicatorsByCategory = (indicators, domainSummary) => {
  const categories = [...new Set(indicators.map((i) => i.category))];

  return categories.map((cat) => {
    const items = indicators.filter((i) => i.category === cat);
    const totalRow = domainSummary.find(
      (d) => d.isCategoryTotal && cat.split(":")[0].toUpperCase() === d.label.split(":")[0].toUpperCase()
    );

    return {
      category: cat,
      items,
      score: totalRow?.score ?? items.reduce((s, i) => s + i.score, 0),
      maxWeight: totalRow?.maxWeight ?? items.reduce((s, i) => s + i.weight, 0),
    };
  });
};

export const PGIIndicatorSection = ({ indicators = [], domainSummary = [], overall }) => {
  const groups = groupIndicatorsByCategory(indicators, domainSummary);

  // Anything below the PGI-D "Akanshi" cut-off (31%) is a genuine weak
  // spot, not just below-average noise — these get pulled into the
  // Action Points list below instead of staying buried in an accordion.
  const weakIndicators = indicators
    .map((item) => ({ ...item, pct: item.weight ? (item.score / item.weight) * 100 : 0 }))
    .filter((item) => item.pct < 31)
    .sort((a, b) => a.pct - b.pct);

  return (
    <Box>
      {overall && (
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 2, px: 0.5 }}>
          <Chip
            label={`Overall: ${overall.score.toFixed(1)} / ${overall.maxWeight} (${overall.percentAchieved.toFixed(1)}%)`}
            sx={{ bgcolor: "#0F172A", color: "#fff", fontWeight: 600 }}
          />
          <Chip label={overall.grade} sx={{ bgcolor: "#F0B429", color: "#fff", fontWeight: 600 }} />
        </Box>
      )}

      {groups.map((g) => {
        const pct = g.maxWeight ? (g.score / g.maxWeight) * 100 : 0;

        return (
          <Accordion key={g.category} disableGutters sx={{ mb: 1, "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", pr: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{g.category}</Typography>
                <Typography
                  sx={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontWeight: 700,
                    fontSize: 13,
                    color: scoreColor(pct),
                  }}
                >
                  {g.score.toFixed(1)} / {g.maxWeight} ({pct.toFixed(1)}%)
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F5F6FA" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Domain</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Indicator</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>
                      Score
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {g.items.map((item, idx) => {
                    const itemPct = item.weight ? (item.score / item.weight) * 100 : 0;
                    const isWeak = itemPct < 31;

                    return (
                      <TableRow key={idx} hover sx={isWeak ? { bgcolor: "#FDEAEA" } : undefined}>
                        <TableCell sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>
                          {item.domain}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12.5 }}>
                          {item.indicator}
                          {isWeak && (
                            <Chip
                              label="Weak"
                              size="small"
                              sx={{ ml: 1, height: 18, fontSize: 10, fontWeight: 700, bgcolor: "#D32F2F", color: "#fff" }}
                            />
                          )}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontFamily: '"IBM Plex Mono", monospace',
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: isWeak ? "#B71C1C" : "inherit",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.score.toFixed(2)} / {item.weight} <span style={{ opacity: 0.7 }}>({itemPct.toFixed(1)}%)</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {weakIndicators.length > 0 && (
        <Box
          sx={{
            mt: 3,
            p: 2.5,
            borderRadius: 2,
            bgcolor: "#FFFBEF",
            border: "1px dashed #F0B429",
          }}
        >
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 16, color: "#16233B", mb: 0.5 }}>
            🎯 Action Points — Weakest Indicators ({weakIndicators.length})
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 1.5 }}>
            Every indicator below is under 31% (PGI-D's own "Akanshi" cut-off) — these are the specific lines
            dragging the district's score down, in order from weakest to least-weak.
          </Typography>

          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            {weakIndicators.map((item, i) => (
              <Box component="li" key={i} sx={{ mb: 1.2 }}>
                <Typography sx={{ fontSize: 13.5, color: "#16233B" }}>
                  <strong>{item.indicator}</strong>{" "}
                  <span style={{ color: "text.secondary", fontSize: 12 }}>({item.domain})</span> — currently{" "}
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: "#B71C1C" }}>
                    {item.score.toFixed(2)} / {item.weight} ({item.pct.toFixed(1)}%)
                  </span>
                  . Needs a targeted push to cross the 31% Akanshi line before the next assessment cycle.
                  {item.dataSource && (
                    <span style={{ marginLeft: 6 }}>
                      <Chip
                        label={`📁 ${item.dataSource}`}
                        size="small"
                        sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: "#EEF4FD", color: "#1976D2" }}
                      />
                    </span>
                  )}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Full SAT Learning-Outcome breakdown for one district, grouped by subject
// — same visual treatment as PGIIndicatorSection above, just for SAT's own
// grain of detail (LOs instead of PGI-D indicators). Weak cut-off here is
// 45%, matching the Watch/Support line used everywhere else SAT % shows up
// (SATHeatMapChart, WhatIfSimulator), unlike PGI-D's own 31% Akanshi line.
export const SATLOBreakdownSection = ({ los = [] }) => {
  const subjects = [...new Set(los.map((l) => l.subject))];
  const groups = subjects.map((subject) => ({
    subject,
    items: los.filter((l) => l.subject === subject),
  }));

  const weakLOs = los.filter((l) => l.pct < 45).sort((a, b) => a.pct - b.pct);

  if (los.length === 0) {
    return (
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
        No Learning-Outcome level data available for this district.
      </Typography>
    );
  }

  return (
    <Box>
      {groups.map((g) => {
        const avgPct = g.items.reduce((s, i) => s + i.pct, 0) / (g.items.length || 1);

        return (
          <Accordion key={g.subject} disableGutters sx={{ mb: 1, "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", pr: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{g.subject}</Typography>
                <Typography
                  sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 13, color: scoreColor(avgPct) }}
                >
                  Avg {avgPct.toFixed(1)}%
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F5F6FA" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>LO Code</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Learning Outcome</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>
                      Score
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {g.items.map((item, idx) => {
                    const isWeak = item.pct < 45;
                    return (
                      <TableRow key={idx} hover sx={isWeak ? { bgcolor: "#FDEAEA" } : undefined}>
                        <TableCell sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>
                          {item.loCode}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12.5 }}>
                          {item.indicator}
                          {isWeak && (
                            <Chip
                              label="Weak"
                              size="small"
                              sx={{ ml: 1, height: 18, fontSize: 10, fontWeight: 700, bgcolor: "#D32F2F", color: "#fff" }}
                            />
                          )}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontFamily: '"IBM Plex Mono", monospace',
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: isWeak ? "#B71C1C" : "inherit",
                          }}
                        >
                          {item.obtainedMarks.toFixed(1)} / {item.totalMarks} ({item.pct.toFixed(1)}%)
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {weakLOs.length > 0 && (
        <Box sx={{ mt: 3, p: 2.5, borderRadius: 2, bgcolor: "#FFFBEF", border: "1px dashed #F0B429" }}>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 16, color: "#16233B", mb: 0.5 }}>
            🎯 Action Points — Weakest Learning Outcomes ({weakLOs.length})
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 1.5 }}>
            Every Learning Outcome below is under 45% — the specific SAT lines dragging this district's subject
            scores down, weakest first.
          </Typography>

          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            {weakLOs.map((item, i) => (
              <Box component="li" key={i} sx={{ mb: 1.2 }}>
                <Typography sx={{ fontSize: 13.5, color: "#16233B" }}>
                  <strong>{item.indicator}</strong>{" "}
                  <span style={{ color: "#5B6B85", fontSize: 12 }}>({item.subject})</span> — currently{" "}
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: "#B71C1C" }}>
                    {item.obtainedMarks.toFixed(1)} / {item.totalMarks} ({item.pct.toFixed(1)}%)
                  </span>
                  . Needs a targeted push before the next assessment cycle.
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

const groupCompetenciesBySubject = (data) => {
  const subjects = [...new Set(data.map((r) => r.subject))];
  return subjects.map((subject) => ({
    subject,
    rows: data.filter((r) => r.subject === subject),
  }));
};

const CompetencyTable = ({ data = [] }) => {
  const groups = groupCompetenciesBySubject(data);

  // A competency is a weak spot if the district is clearly below the
  // Watch/Support line (45%) or is meaningfully behind the national
  // benchmark (3+ points), not just marginally under either one.
  const weakRows = data
    .map((r) => ({ ...r, districtPct: r.district * 100, gapPct: (r.district - r.national) * 100 }))
    .filter((r) => r.districtPct < 45 || r.gapPct <= -3)
    .sort((a, b) => a.districtPct - b.districtPct);

  return (
    <Box>
      {groups.map((g) => {
        const avgDistrict = g.rows.reduce((s, r) => s + r.district, 0) / g.rows.length;
        const avgPct = avgDistrict * 100;

        return (
          <Accordion key={g.subject} disableGutters sx={{ mb: 1, "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", pr: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{g.subject}</Typography>
                <Typography
                  sx={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontWeight: 700,
                    fontSize: 13,
                    color: scoreColor(avgPct),
                  }}
                >
                  Avg {avgPct.toFixed(1)}%
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F5F6FA" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Competency</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>
                      National %
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>
                      District %
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>
                      Gap
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {g.rows.map((row, idx) => {
                    const districtPct = row.district * 100;
                    const gap = row.district - row.national;
                    const isWeak = districtPct < 45 || gap * 100 <= -3;

                    return (
                      <TableRow key={idx} hover sx={isWeak ? { bgcolor: "#FDEAEA" } : undefined}>
                        <TableCell sx={{ fontSize: 12.5 }}>
                          {row.description}
                          {isWeak && (
                            <Chip
                              label="Weak"
                              size="small"
                              sx={{ ml: 1, height: 18, fontSize: 10, fontWeight: 700, bgcolor: "#D32F2F", color: "#fff" }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12.5 }}>
                          {(row.national * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontFamily: '"IBM Plex Mono", monospace',
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: isWeak ? "#B71C1C" : "inherit",
                          }}
                        >
                          {districtPct.toFixed(1)}%
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontFamily: '"IBM Plex Mono", monospace',
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: gap >= 0 ? "#2E7D32" : "#D32F2F",
                          }}
                        >
                          {gap >= 0 ? "+" : ""}
                          {(gap * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {weakRows.length > 0 && (
        <Box sx={{ mt: 2, p: 2.5, borderRadius: 2, bgcolor: "#FFFBEF", border: "1px dashed #F0B429" }}>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 16, color: "#16233B", mb: 0.5 }}>
            🎯 Action Points — Weakest Competencies ({weakRows.length})
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 1.5 }}>
            Every competency below is either under 45% or at least 3 points behind the national benchmark — in
            order from weakest to least-weak.
          </Typography>

          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            {weakRows.map((row, i) => (
              <Box component="li" key={i} sx={{ mb: 1.2 }}>
                <Typography sx={{ fontSize: 13.5, color: "#16233B" }}>
                  <strong>{row.description}</strong>{" "}
                  <span style={{ color: "#5B6B85", fontSize: 12 }}>({row.subject})</span> — currently{" "}
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: "#B71C1C" }}>
                    {row.districtPct.toFixed(1)}%
                  </span>{" "}
                  vs national {(row.national * 100).toFixed(1)}%
                  {row.gapPct <= -3 && (
                    <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: "#B71C1C" }}>
                      {" "}
                      ({row.gapPct.toFixed(1)}% gap)
                    </span>
                  )}
                  .
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// The stage dropdown + weak-highlighted competency table + Action Points,
// as one reusable block — used both inside DistrictDeepDive (Reports page)
// and directly on the PARAKH page itself for whichever district is
// currently selected there.
export const PARAKHCompetencySection = ({ competencies }) => {
  const [tab, setTab] = useState(0);

  const stageLabels = ["Foundational (Grade 3)", "Preparatory (Grade 6)", "Middle (Grade 9)"];
  const stageData = [competencies.g3, competencies.g6, competencies.g9];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Stage</Typography>
        <TextField
          select
          size="small"
          value={tab}
          onChange={(e) => setTab(Number(e.target.value))}
          className="no-print"
          sx={{ minWidth: 220 }}
        >
          {stageLabels.map((label, i) => (
            <MenuItem key={label} value={i}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* All 3 stages are always in the DOM. On screen only the selected
          stage is shown; the "print-show-all" class (see index.css) forces
          every stage to be visible when printing, so a report card
          never leaves out G3/G6/G9 data just because a different stage
          was selected on screen. */}
      {stageLabels.map((label, i) => (
        <Box
          key={label}
          className="print-show-all"
          sx={{ display: tab === i ? "block" : "none", overflowX: "auto" }}
        >
          {tab !== i && (
            <Typography
              className="print-only-label"
              sx={{ display: "none", fontWeight: 700, fontSize: 14, mt: 3, mb: 1 }}
              component="div"
            >
              {label}
            </Typography>
          )}
          <CompetencyTable data={stageData[i] || []} />
        </Box>
      ))}
    </Box>
  );
};

const DistrictDeepDive = ({ pgiDetail, competencies }) => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 3, border: "1px solid #E4E7F0" }} elevation={0}>
      <CardContent>
        <Typography
          sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}
        >
          🔎 PGI-D 2.0 — Full Indicator Breakdown (70 Indicators)
        </Typography>

        <PGIIndicatorSection
          indicators={pgiDetail.indicators}
          domainSummary={pgiDetail.domainSummary}
          overall={pgiDetail.overall}
        />

        <Typography
          sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mt: 4, mb: 1, color: "#16233B" }}
        >
          📖 PARAKH — Competency-wise Mastery vs National Benchmark
        </Typography>

        <PARAKHCompetencySection competencies={competencies} />
      </CardContent>
    </Card>
  );
};

export default DistrictDeepDive;