import { useState, useEffect } from "react";
import { Box, Paper, Typography, Chip, TextField, MenuItem } from "@mui/material";
import { colors } from "../theme/theme";
import WhatIfSimulator from "./WhatIfSimulator";

const PRIORITY_STYLES = {
  CRITICAL: { bar: "#D32F2F", chipBg: "#FDE2E1", chipText: "#C0392B", icon: "🔺" },
  HIGH: { bar: "#FB8C00", chipBg: "#FFECD1", chipText: "#B05F00", icon: "⚠️" },
  MEDIUM: { bar: "#F0B429", chipBg: "#FFF4D6", chipText: "#8A6200", icon: "⚠️" },
};

// Full detail card for the single selected district — the Recommended
// Action gets its own clearly highlighted block instead of a single
// small line, since that's the part that actually matters here.
const DistrictDetailCard = ({ item }) => {
  const style = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.MEDIUM;

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: 3,
        boxShadow: "0 1px 6px rgba(15,23,42,0.08)",
        overflow: "hidden",
        borderLeft: `6px solid ${style.bar}`,
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 20, color: "#16233B" }}>
            {item.icon} {item.title}
          </Typography>

          <Chip
            label={`${style.icon} ${item.priority}`}
            size="small"
            sx={{ bgcolor: style.chipBg, color: style.chipText, fontWeight: 700, fontSize: 12 }}
          />
        </Box>

        <Typography sx={{ fontSize: 14, color: "text.secondary", mt: 1 }}>
          {item.description}
        </Typography>

        {item.recommendation && (
          <Box
            sx={{
              mt: 2.5,
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#FFF8ED",
              border: "1px solid #FCE3B8",
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: "#B05F00", textTransform: "uppercase" }}>
              ✅ Recommended Action
            </Typography>
            <Typography sx={{ fontSize: 15, color: "#16233B", mt: 0.8, lineHeight: 1.6 }}>
              {item.recommendation}
            </Typography>
          </Box>
        )}

        {item.weakAreas && item.weakAreas.length > 0 ? (
          <Box sx={{ mt: 2.5, p: 2.5, borderRadius: 2, bgcolor: "#FFFBEF", border: "1px dashed #F0B429" }}>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 16, color: "#16233B", mb: 0.5 }}>
              🎯 Action Points — Weak Subjects ({item.weakAreas.length})
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 1.5 }}>
              {item.dualSemester
                ? "Every subject below is behind that semester's own state average — Sem 1 and Sem 2 are compared separately, in order from furthest behind to closest."
                : item.weakAreas[0]?.stateAvg != null
                ? "Every subject below is behind the state average for that subject specifically, in order from furthest behind to closest."
                : "Every subject below is under the 60% Strong line — Watch (45–59%) and Needs Support (<45%) both included, in order from weakest to least-weak."}
            </Typography>

            <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
              {item.weakAreas.map((w, i) => (
                <Box component="li" key={i} sx={{ mb: 1.2 }}>
                  {item.dualSemester ? (
                    <Typography sx={{ fontSize: 13.5, color: "#16233B" }}>
                      <strong>{w.label}</strong>{" "}
                      <span style={{ color: "#5B6B85", fontSize: 12 }}>(vs state average)</span>
                      {" — "}
                      <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12.5 }}>
                        S1:{" "}
                        <strong style={{ color: w.sem1Gap != null && w.sem1Gap < 0 ? "#B71C1C" : "#16233B" }}>
                          {w.sem1Pct != null ? `${w.sem1Pct.toFixed(1)}%` : "—"}
                        </strong>
                        {w.sem1StateAvg != null && ` (state ${w.sem1StateAvg.toFixed(1)}%)`}
                        {" · "}
                        S2:{" "}
                        <strong style={{ color: w.sem2Gap != null && w.sem2Gap < 0 ? "#B71C1C" : "#16233B" }}>
                          {w.sem2Pct != null ? `${w.sem2Pct.toFixed(1)}%` : "—"}
                        </strong>
                        {w.sem2StateAvg != null && ` (state ${w.sem2StateAvg.toFixed(1)}%)`}
                      </span>
                      . {w.recommendation}
                    </Typography>
                  ) : w.stateAvg != null ? (
                    <Typography sx={{ fontSize: 13.5, color: "#16233B" }}>
                      <strong>{w.label}</strong>{" "}
                      <span style={{ color: "#5B6B85", fontSize: 12 }}>(🔻 below state average)</span>{" "}
                      — currently{" "}
                      <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: "#B71C1C" }}>
                        {w.pct.toFixed(1)}%
                      </span>{" "}
                      <span style={{ color: "#5B6B85", fontSize: 12 }}>(state avg {w.stateAvg.toFixed(1)}%)</span>
                      . {w.recommendation}
                    </Typography>
                  ) : (
                    <Typography sx={{ fontSize: 13.5, color: "#16233B" }}>
                      <strong>{w.label}</strong>{" "}
                      <span style={{ color: "#5B6B85", fontSize: 12 }}>
                        ({w.band === "Needs Support" ? "🔺 Needs Support" : "⚠️ Watch"})
                      </span>{" "}
                      — currently{" "}
                      <span
                        style={{
                          fontFamily: '"IBM Plex Mono", monospace',
                          fontWeight: 700,
                          color: w.band === "Needs Support" ? "#B71C1C" : "#B05F00",
                        }}
                      >
                        {w.pct.toFixed(1)}%
                      </span>
                      . {w.recommendation}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        ) : item.weakAreas ? (
          <Box sx={{ mt: 2.5, p: 2.5, borderRadius: 2, bgcolor: "#EEF7EE", border: "1px solid #C9E6C9" }}>
            <Typography sx={{ fontSize: 13.5, color: "#1B5E20", fontWeight: 600 }}>
              ✅ No weak subjects found — {item.district} is at or above{" "}
              {item.dualSemester ? "the state average, in both semesters," : "the relevant line"} on every subject.
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

const ActionItemsQueue = ({ items = [], allDistricts = [], allItems = [], syncDistrict = "All", focusDistricts = [] }) => {
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Priority order for what this panel shows by default:
  // 1) the two districts picked in "Compare Two Districts" above (focusDistricts)
  // 2) the page's own District filter, if set to one specific district
  // Picking a district from the dropdown below always overrides both.
  useEffect(() => {
    if (focusDistricts.length) {
      setSelectedDistrict((prev) => (focusDistricts.includes(prev) ? prev : focusDistricts[0]));
    } else {
      setSelectedDistrict(syncDistrict !== "All" ? syncDistrict : "");
    }
  }, [syncDistrict, focusDistricts.join("|")]);

  const source = allItems.length ? allItems : items;
  const detail = selectedDistrict
    ? source.find((i) => i.district === selectedDistrict || i.title?.startsWith(selectedDistrict))
    : null;

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, overflow: "hidden", mt: 3, mb: 3 }}>
      {/* Header banner */}
      <Box
        sx={{
          background: `linear-gradient(120deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
          color: "#fff",
          p: 3,
          borderTop: `4px solid ${colors.gold}`,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22 }}>
              🎯 Top Action Items — District Priority Queue
            </Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.85, mt: 0.5 }}>
              Select a district (or use the District filter above) to see its priority action plan
            </Typography>
          </Box>

          {allDistricts.length > 0 && (
            <TextField
              select
              size="small"
              label="View detail for a district"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              sx={{
                minWidth: 240,
                bgcolor: "rgba(255,255,255,0.95)",
                borderRadius: 1,
              }}
            >
              <MenuItem value="">Select a district…</MenuItem>
              {allDistricts.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Box>

        {focusDistricts.length > 1 && (
          <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
            {focusDistricts.map((d) => (
              <Chip
                key={d}
                label={d}
                onClick={() => setSelectedDistrict(d)}
                sx={{
                  fontWeight: 700,
                  bgcolor: selectedDistrict === d ? colors.gold : "rgba(255,255,255,0.14)",
                  color: selectedDistrict === d ? colors.navy : "#fff",
                  "&:hover": { bgcolor: selectedDistrict === d ? colors.goldLight : "rgba(255,255,255,0.22)" },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: "#F5F6FA" }}>
        {detail ? (
          <>
            <DistrictDetailCard item={detail} />
            <WhatIfSimulator item={detail} metricLabel={detail.metric || "Score"} />
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
            <Typography sx={{ fontSize: 14 }}>
              👆 Pick a district above to see its priority action plan.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ActionItemsQueue;