import { useState, useEffect } from "react";
import { Box, Typography, Slider, Chip } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { colors, fontDisplay, fontMono } from "../theme/theme";

// Depth of the plan scales with how big a jump the slider is asking for —
// a 2-point nudge and a 20-point turnaround need different advice, not the
// same paragraph repeated. This is what makes the panel move with the
// slider instead of always showing the same static recommendation.
const buildActionPlan = (district, delta, currentBand, targetBand) => {
  const steps = [];

  if (delta <= 0) {
    steps.push(
      "The slider is at or below today's score — the priority here is protecting the current level, not chasing new gains."
    );
    steps.push(
      "Keep the existing remedial and monitoring cycle running so the district doesn't slip into a weaker band by the next assessment."
    );
  } else if (delta <= 5) {
    steps.push(
      `A ${delta.toFixed(1)}-point gain is realistic within a single term with a tightly scoped push, not a district-wide overhaul.`
    );
    steps.push(
      "Run four to six weeks of targeted remedial sessions on the weakest indicator identified above, then re-test the same students to confirm the gap actually closed."
    );
    steps.push(
      "This scale of gain typically doesn't need new infrastructure or staffing — it's an instruction-focused fix, best owned at the school/cluster level."
    );
  } else if (delta <= 15) {
    steps.push(
      `A ${delta.toFixed(1)}-point gain needs a full-term structural push, not a one-off remedial camp.`
    );
    steps.push(
      "Move from annual to monthly learning-outcome monitoring so slippage is caught early instead of only surfacing at the next assessment cycle."
    );
    steps.push(
      "Pair the weakest schools in the district with a subject-specific coaching cycle, rotating the focus every six to eight weeks based on what the monthly data shows."
    );
    steps.push(
      "Bring block-level education officers into a monthly review so the push has administrative follow-through behind it, not just teacher-level effort."
    );
  } else {
    steps.push(
      `A ${delta.toFixed(1)}-point gain is a multi-term, district-wide turnaround — it won't come from a single intervention.`
    );
    steps.push(
      "Start with a school-level diagnostic to find which schools are pulling the district average down the most, and prioritize those first."
    );
    steps.push(
      "Combine remedial teaching, monthly FLN monitoring, subject-specific coaching cycles, and stronger SMC/PTM engagement so the push is reinforced from several directions at once."
    );
    steps.push(
      "Set quarterly interim checkpoints rather than waiting for the next annual assessment, so there's room to course-correct mid-way instead of finding out too late."
    );
  }

  if (currentBand.label !== targetBand.label) {
    steps.push(
      `Crossing from "${currentBand.label}" into "${targetBand.label}" moves ${district} into a different priority tier in the state ranking — a real administrative milestone, not just a number moving.`
    );
  }

  return steps;
};

// Same three-band read as the rest of the app (SATHeatMapChart, priority
// thresholds, etc.) so "Strong / Watch / Needs Support" always means the
// same cut points everywhere a percentage shows up.
const bandFor = (pct) =>
  pct >= 60
    ? { label: "Strong", color: "#2E7D32", bg: "#E6F4EA" }
    : pct >= 45
    ? { label: "Watch", color: "#B15C00", bg: "#FFF3E0" }
    : { label: "Needs Support", color: "#B71C1C", bg: "#FDEAEA" };

// A single lever, driven by whatever numeric "percent" the calling page's
// action item already carries (SAT %, PARAKH %, PGI-D composite %) — this
// component doesn't know or care which metric it is, it just projects a
// target against the same band thresholds used everywhere else.
const WhatIfSimulator = ({ item, metricLabel = "Score" }) => {
  const current = item?.percent;
  const [target, setTarget] = useState(current ?? 0);

  // Re-anchor the slider whenever the selected district (and therefore the
  // underlying item) changes, so it doesn't carry over a stale target from
  // whichever district was picked before.
  useEffect(() => {
    setTarget(current ?? 0);
  }, [item?.district, current]);

  if (current == null || Number.isNaN(current)) return null;

  const currentBand = bandFor(current);
  const targetBand = bandFor(target);
  const delta = target - current;
  const min = Math.max(0, Math.floor(current) - 20);

  return (
    <Box
      sx={{
        mt: 2.5,
        p: 3,
        borderRadius: 3,
        bgcolor: "#FFFBEF",
        border: "1px dashed #F0B429",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <TrendingUpIcon sx={{ fontSize: 20, color: colors.gold }} />
        <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 17, color: "#16233B" }}>
          What-If Simulator — {item.district}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2.5 }}>
        Drag the slider to see what {metricLabel.toLowerCase()} it would take to move {item.district} into the
        next band.
      </Typography>

      <Slider
        value={target}
        min={min}
        max={100}
        step={0.5}
        onChange={(e, v) => setTarget(v)}
        marks={[
          { value: current, label: "Now" },
          { value: 45, label: "45%" },
          { value: 60, label: "60%" },
        ]}
        valueLabelDisplay="on"
        valueLabelFormat={(v) => `${v.toFixed(1)}%`}
        sx={{
          color: colors.gold,
          mt: 1,
          "& .MuiSlider-markLabel": { fontSize: 11, color: "text.secondary" },
          "& .MuiSlider-valueLabel": {
            bgcolor: colors.navy,
            fontFamily: fontMono,
            fontWeight: 700,
          },
        }}
      />

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mt: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: "text.secondary" }}>
            Current {metricLabel}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography sx={{ fontFamily: fontMono, fontWeight: 700, fontSize: 22, color: "#16233B" }}>
              {current.toFixed(1)}%
            </Typography>
            <Chip label={currentBand.label} size="small" sx={{ bgcolor: currentBand.bg, color: currentBand.color, fontWeight: 700 }} />
          </Box>
        </Box>

        <Box>
          <Typography sx={{ fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: "text.secondary" }}>
            If it moves to
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography sx={{ fontFamily: fontMono, fontWeight: 700, fontSize: 22, color: "#16233B" }}>
              {target.toFixed(1)}%
            </Typography>
            <Chip label={targetBand.label} size="small" sx={{ bgcolor: targetBand.bg, color: targetBand.color, fontWeight: 700 }} />
          </Box>
        </Box>

        <Box>
          <Typography sx={{ fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: "text.secondary" }}>
            Net change
          </Typography>
          <Typography
            sx={{
              fontFamily: fontMono,
              fontWeight: 700,
              fontSize: 22,
              color: delta > 0 ? "#2E7D32" : delta < 0 ? "#B71C1C" : "text.secondary",
            }}
          >
            {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"} {Math.abs(delta).toFixed(1)} pts
          </Typography>
        </Box>
      </Box>

      {item.recommendation && (
        <Box sx={{ mt: 2.5, p: 2, borderRadius: 2, bgcolor: "#fff", border: "1px solid #EEE0BE" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: "#B05F00", textTransform: "uppercase" }}>
            ✅ What it takes to get there
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#16233B", mt: 0.8, lineHeight: 1.6 }}>{item.recommendation}</Typography>

          <Box component="ul" sx={{ m: 0, mt: 1.5, pl: 2.5 }}>
            {buildActionPlan(item.district, delta, currentBand, targetBand).map((line, i) => (
              <Typography component="li" key={i} sx={{ fontSize: 14, color: "#16233B", lineHeight: 1.6, mt: i === 0 ? 0 : 0.8 }}>
                {line}
              </Typography>
            ))}
          </Box>
        </Box>
      )}

    </Box>
  );
};

export default WhatIfSimulator;
