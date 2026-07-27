import { useState, useEffect } from "react";
import { Box, Paper, Typography, Chip, TextField, MenuItem } from "@mui/material";

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
      </Box>
    </Box>
  );
};

const ActionItemsQueue = ({ items = [], allDistricts = [], allItems = [], syncDistrict = "All" }) => {
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // If the page's own District filter picks a specific district, mirror
  // that choice here automatically so this panel doesn't feel disconnected
  // from the filter someone just used above it. Choosing "All Districts"
  // in that filter clears the selection below.
  useEffect(() => {
    setSelectedDistrict(syncDistrict !== "All" ? syncDistrict : "");
  }, [syncDistrict]);

  const source = allItems.length ? allItems : items;
  const detail = selectedDistrict
    ? source.find((i) => i.district === selectedDistrict || i.title?.startsWith(selectedDistrict))
    : null;

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, overflow: "hidden", mt: 3, mb: 3 }}>
      {/* Header banner */}
      <Box
        sx={{
          background: "linear-gradient(120deg, #F97316 0%, #FB923C 100%)",
          color: "#fff",
          p: 3,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22 }}>
              🎯 Top Action Items — District Priority Queue
            </Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.9, mt: 0.5 }}>
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
      </Box>

      <Box sx={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: "#F5F6FA" }}>
        {detail ? (
          <DistrictDetailCard item={detail} />
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
