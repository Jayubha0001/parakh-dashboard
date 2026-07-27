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
  Tabs,
  Tab,
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

const PGIIndicatorSection = ({ indicators = [], domainSummary = [], overall }) => {
  const groups = groupIndicatorsByCategory(indicators, domainSummary);

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
                  {g.score.toFixed(1)} / {g.maxWeight}
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
                  {g.items.map((item, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>
                        {item.domain}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12.5 }}>{item.indicator}</TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12.5, fontWeight: 600 }}
                      >
                        {item.score.toFixed(2)} / {item.weight}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

const CompetencyTable = ({ data = [] }) => {
  let lastSubject = null;

  return (
    <Table size="small">
      <TableHead>
        <TableRow sx={{ bgcolor: "#F5F6FA" }}>
          <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Subject</TableCell>
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
        {data.map((row, idx) => {
          const gap = row.district - row.national;
          const showSubject = row.subject !== lastSubject;
          lastSubject = row.subject;

          return (
            <TableRow key={idx} hover>
              <TableCell sx={{ fontSize: 12, fontWeight: showSubject ? 700 : 400, color: "text.secondary" }}>
                {showSubject ? row.subject : ""}
              </TableCell>
              <TableCell sx={{ fontSize: 12.5 }}>{row.description}</TableCell>
              <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12.5 }}>
                {(row.national * 100).toFixed(1)}%
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12.5, fontWeight: 700 }}
              >
                {(row.district * 100).toFixed(1)}%
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
  );
};

const DistrictDeepDive = ({ pgiDetail, competencies }) => {
  const [tab, setTab] = useState(0);

  const stageLabels = ["Foundational (Grade 3)", "Preparatory (Grade 6)", "Middle (Grade 9)"];
  const stageData = [competencies.g3, competencies.g6, competencies.g9];

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

        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          className="no-print"
          sx={{ mb: 1, borderBottom: "1px solid #E4E7F0" }}
        >
          {stageLabels.map((label) => (
            <Tab key={label} label={label} sx={{ textTransform: "none", fontWeight: 600 }} />
          ))}
        </Tabs>

        {/* All 3 stages are always in the DOM. On screen only the active
            tab is shown; the "print-show-all" class (see index.css) forces
            every stage to be visible when printing, so a report card
            never leaves out G3/G6/G9 data just because a different tab
            was selected on screen. */}
        {stageLabels.map((label, i) => (
          <Box
            key={label}
            className={tab === i ? "print-show-all" : "print-show-all"}
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
      </CardContent>
    </Card>
  );
};

export default DistrictDeepDive;
