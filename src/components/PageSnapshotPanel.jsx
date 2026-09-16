import { useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { fontDisplay, fontMono } from "../theme/theme";
import { isPriorityDistrict } from "../utils/priorityDistricts";
import GujaratBubbleMap from "./GujaratBubbleMap";

// Light/teal "Executive Snapshot" card — same structure as the dashboard's
// dark navy+gold panel (map, coverage donut, Priority-vs-Other bar,
// breakdown bar, priority-district chips), just re-skinned to the
// white-card + teal/gold palette so it drops onto PARAKH / PGI / SAT /
// PM Shri the same way it drops onto the home Dashboard, using each
// page's own metric instead of a cross-domain one.

const TEAL = "#1F8A70";
const GOLD = "#F0B429";
const OTHER = "#B7BFCF";
const INK = "#16233B";
const SLATE = "#5B6B85";

const PageSnapshotPanel = ({
  eyebrow = "Government of Gujarat · School Education Department",
  title,
  metricLabel,
  valueSuffix = "%",
  district = "All",
  setDistrict = () => {},
  districts = [],
  priorityOnly = false,
  dataByDistrict = {},
  totalDistricts = 33,
  priorityCount = 10,
  otherCount = 23,
  compareData = [], // [{ label, Priority, Other }]
  breakdownTitle = "Breakdown",
  breakdownData = [], // [{ label, Priority, Other }]
  priorityListTitle = "⭐ Priority Districts",
  priorityList = [], // [{ District, Value }]
  stateAvg = null,
  // Optional second year for the single-district comparison chart (e.g.
  // PGI's 2024-25) — when given alongside the (25-26) values above, the
  // "district vs state average" chart plots both years instead of only
  // whichever year the main dataByDistrict/stateAvg happen to be.
  dataByDistrictPrevYear = null,
  stateAvgPrevYear = null,
  yearLabel = null,
  prevYearLabel = null,
  rankOf = () => null,
  // Optional extra content (e.g. PGI's domain-wise score cards) rendered
  // inside this same white card, below the priority-district chips —
  // lets a page fold its own detail section into the snapshot panel
  // instead of floating it as a second, separate card on the page.
  extraSection = null,
}) => {
  const isSingleDistrict = district !== "All";
  const selectedValue = dataByDistrict[district];
  const selectedRank = isSingleDistrict ? rankOf(district) : null;

  const donutData = priorityOnly
    ? [{ name: "Priority", value: priorityCount }]
    : [
        { name: "Priority", value: priorityCount },
        { name: "Other", value: otherCount },
      ];

  const hasPrevYear = dataByDistrictPrevYear != null;
  const round1 = (v) => (v != null ? Number(v.toFixed(1)) : null);

  const districtCompareData = isSingleDistrict
    ? hasPrevYear
      ? [
          {
            label: prevYearLabel || "Previous Year",
            District: round1(dataByDistrictPrevYear[district]),
            "State Avg": round1(stateAvgPrevYear),
          },
          {
            label: yearLabel || metricLabel,
            District: round1(selectedValue),
            "State Avg": round1(stateAvg),
          },
        ]
      : [{ label: metricLabel, District: selectedValue != null ? Number(selectedValue.toFixed(1)) : null, "State Avg": stateAvg != null ? Number(stateAvg.toFixed(1)) : null }]
    : compareData;

  return (
    <Box
      sx={{
        borderRadius: 4,
        background: "#fff",
        borderTop: `3px solid ${TEAL}`,
        border: "1px solid #E4E7F0",
        p: { xs: 2, sm: 2.5 },
        mt: { xs: 1.5, md: 2 },
        boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
      }}
    >
      <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: TEAL, mb: 0.3 }}>
        {eyebrow}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 2, pb: 1.5, borderBottom: "1px solid #E4E7F0" }}>
        <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 18, color: INK }}>
          📊 {title}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: SLATE }}>
          {isSingleDistrict
            ? `📍 Showing: ${district}`
            : priorityOnly
            ? "⭐ Showing the 10 priority districts only"
            : `⭐ Priority (${priorityCount}) vs Other (${otherCount}) districts, throughout`}
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {/* Map */}
        <Grid size={{ xs: 12, md: 3 }}>
          <GujaratBubbleMap
            light
            district={district}
            setDistrict={setDistrict}
            districts={districts}
            dataByDistrict={dataByDistrict}
            metricLabel={metricLabel}
            valueSuffix={valueSuffix}
            priorityDistricts={districts.filter((d) => isPriorityDistrict(d))}
          />
        </Grid>

        {/* Coverage donut */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK, mb: 1 }}>
            Districts Covered
          </Typography>
          <Box sx={{ height: 190, position: "relative" }}>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={2}>
                  {donutData.map((d) => (
                    <Cell key={d.name} fill={d.name === "Priority" ? GOLD : TEAL} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ position: "absolute", top: "54%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
              <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 20, color: INK }}>{totalDistricts}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1.2, mt: 0.5, flexWrap: "wrap" }}>
              {donutData.map((d) => (
                <Box key={d.name} sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: d.name === "Priority" ? GOLD : TEAL }} />
                  <Typography sx={{ fontSize: 10.5, color: SLATE }}>
                    {d.name} ({d.value})
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Avg score / metric comparison */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK, mb: 1 }}>
            {isSingleDistrict ? `${district} vs State Average` : `Avg ${metricLabel} — Priority vs Other`}
          </Typography>
          <ResponsiveContainer width="100%" height={175}>
            <BarChart data={isSingleDistrict ? districtCompareData : compareData} margin={{ left: -18, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: SLATE }} />
              <YAxis unit={valueSuffix} domain={[0, 100]} tick={{ fontSize: 10, fill: SLATE }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => `${v}${valueSuffix}`} />
              {isSingleDistrict ? (
                <>
                  <Bar dataKey="District" fill={GOLD} radius={[3, 3, 0, 0]} barSize={16} />
                  <Bar dataKey="State Avg" fill={TEAL} radius={[3, 3, 0, 0]} barSize={16} />
                </>
              ) : (
                <>
                  <Bar dataKey="Priority" fill={GOLD} radius={[3, 3, 0, 0]} barSize={16} />
                  {!priorityOnly && <Bar dataKey="Other" fill={TEAL} radius={[3, 3, 0, 0]} barSize={16} />}
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </Grid>

        {/* Breakdown (grade split / domain split / whatever this page's
            second-most-useful cut is) or a single-district profile card. */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK, mb: 1 }}>
            {isSingleDistrict ? `${district} — Profile` : breakdownTitle}
          </Typography>
          {isSingleDistrict ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.7 }}>
              {[
                { label: `Rank (of ${totalDistricts})`, value: selectedRank > 0 ? `#${selectedRank}` : "—" },
                { label: metricLabel, value: selectedValue != null ? `${selectedValue.toFixed(1)}${valueSuffix}` : "—" },
                { label: "State Average", value: stateAvg != null ? `${stateAvg.toFixed(1)}${valueSuffix}` : "—" },
                { label: "Priority District", value: isPriorityDistrict(district) ? "Yes ⭐" : "No" },
              ].map((r) => (
                <Box key={r.label} sx={{ display: "flex", justifyContent: "space-between", bgcolor: "#F5F6FA", borderRadius: 1.5, px: 1, py: 0.7 }}>
                  <Typography sx={{ fontSize: 11.5, color: SLATE }}>{r.label}</Typography>
                  <Typography sx={{ fontFamily: fontMono, fontSize: 12, fontWeight: 700, color: INK }}>{r.value}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={175}>
              <BarChart data={breakdownData} layout="vertical" margin={{ left: 8, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: SLATE }} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: INK }} width={72} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="Priority" stackId="g" fill={GOLD} radius={[0, 0, 0, 0]} barSize={14} />
                {!priorityOnly && <Bar dataKey="Other" stackId="g" fill={TEAL} radius={[0, 4, 4, 0]} barSize={14} />}
              </BarChart>
            </ResponsiveContainer>
          )}
        </Grid>

        {/* Priority district chips */}
        <Grid size={{ xs: 12, md: 12 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK, mb: 1 }}>
            {priorityListTitle}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
            {priorityList.map((d) => {
              const isSelectedChip = isSingleDistrict && d.District === district;
              return (
                <Box
                  key={d.District}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    bgcolor: isSelectedChip ? "rgba(31,138,112,0.14)" : "#F5F6FA",
                    border: isSelectedChip ? `1.5px solid ${TEAL}` : "1.5px solid transparent",
                    borderLeft: `3px solid ${GOLD}`,
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    minWidth: 140,
                    cursor: "pointer",
                  }}
                  onClick={() => setDistrict(d.District)}
                >
                  <Typography sx={{ fontSize: 11.5, color: INK, fontWeight: 600, whiteSpace: "nowrap" }}>
                    {d.District}
                  </Typography>
                  <Typography sx={{ fontFamily: fontMono, fontSize: 11, fontWeight: 700, color: TEAL }}>
                    {d.Value != null ? `${d.Value.toFixed(1)}${valueSuffix}` : "—"}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Grid>
      </Grid>

      {extraSection && (
        <Box sx={{ mt: 2.5, pt: 2.25, borderTop: "1px solid #E4E7F0" }}>
          {extraSection}
        </Box>
      )}
    </Box>
  );
};

export default PageSnapshotPanel;
