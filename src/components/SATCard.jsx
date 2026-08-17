// src/components/SATCard.jsx
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Divider,
  Button,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { styled } from "@mui/material/styles";

// Styled components for better look
const GradientHeader = styled(Box)({
  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  color: "#fff",
  padding: "16px 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "8px",
});

const RankItem = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "6px 0",
  borderBottom: "1px solid #EEF0F5",
  "&:last-child": {
    borderBottom: "none",
  },
});

const SATCard = ({ satData }) => {
  const navigate = useNavigate();
  const { top, bottom, stateAverage, gradePerformance, totalDistricts } = satData;

  // Color for grade performance
  const getGradeColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 4,
        mt: 2.5,
        border: "1px solid #E4E7F0",
        overflow: "hidden",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      {/* Header */}
      <GradientHeader>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography
            sx={{
              fontFamily: '"Fraunces", serif',
              fontWeight: 700,
              fontSize: { xs: 18, sm: 22 },
            }}
          >
            📚 SAT Semester Assessment
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip
            label={`${totalDistricts} Districts`}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontWeight: 600,
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            }}
          />
          <Chip
            label="2025-26"
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "#fff",
              fontWeight: 500,
            }}
          />
        </Box>
      </GradientHeader>

      <CardContent sx={{ p: 3 }}>
        {/* KPI Row */}
        <Grid container spacing={2}>
          {/* State Average */}
          <Grid item xs={6} sm={4} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: "center",
                bgcolor: "#F5F7FA",
                borderRadius: 2,
                height: "100%",
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                STATE AVERAGE
              </Typography>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: "#1976D2", fontFamily: '"Fraunces", serif' }}
              >
                {stateAverage}%
              </Typography>
            </Paper>
          </Grid>

          {/* Top District */}
          <Grid item xs={6} sm={4} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: "center",
                bgcolor: "#E8F5E9",
                borderRadius: 2,
                height: "100%",
                borderLeft: "4px solid #2E7D32",
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                🏆 TOP DISTRICT
              </Typography>
              {top && top.length > 0 && (
                <>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ color: "#1B5E20" }}
                  >
                    {top[0].district}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {top[0].averageScore}%
                    </Typography>
                    <Chip
                      label={top[0].grade}
                      size="small"
                      sx={{ bgcolor: "#2E7D32", color: "#fff", fontWeight: 600 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Marks: {top[0].totalObtainedScore?.toLocaleString() || 0}
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>

          {/* Needs Support */}
          <Grid item xs={6} sm={4} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: "center",
                bgcolor: "#FFEBEE",
                borderRadius: 2,
                height: "100%",
                borderLeft: "4px solid #D32F2F",
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                ⚠️ NEEDS SUPPORT
              </Typography>
              {bottom && bottom.length > 0 && (
                <>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ color: "#B71C1C" }}
                  >
                    {bottom[0].district}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
                    <Typography variant="h5" fontWeight="bold" color="error">
                      {bottom[0].averageScore}%
                    </Typography>
                    <Chip
                      label={bottom[0].grade}
                      size="small"
                      sx={{ bgcolor: "#D32F2F", color: "#fff", fontWeight: 600 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Marks: {bottom[0].totalObtainedScore?.toLocaleString() || 0}
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>

          {/* Grade Performance Summary */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: "center",
                bgcolor: "#FFF8E1",
                borderRadius: 2,
                height: "100%",
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                🎯 GRADE AVG
              </Typography>
              {gradePerformance.map((item, idx) => (
                <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                  <Chip
                    label={item.grade}
                    size="small"
                    color={getGradeColor(item.averageScore)}
                    sx={{ height: 20, fontSize: "10px" }}
                  />
                  <Typography variant="body2" fontWeight="bold">
                    {item.averageScore}%
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />

        {/* Top 5 & Bottom 5 */}
        <Grid container spacing={2}>
          {/* Top 5 */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              sx={{ color: "#2E7D32", mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              🏆 Top 5 Districts
            </Typography>
            <Paper elevation={0} sx={{ bgcolor: "#FAFAFA", borderRadius: 2, p: 1 }}>
              {top.map((item, index) => (
                <RankItem key={index}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: index === 0 ? "#F0B429" : index === 1 ? "#9AA5B1" : index === 2 ? "#B08D57" : "#E0E0E0",
                        color: index < 3 ? "#fff" : "#666",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Typography variant="body2" fontWeight={index < 3 ? 600 : 400}>
                      {item.district}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: "#2E7D32" }}>
                    {item.averageScore}%
                  </Typography>
                </RankItem>
              ))}
            </Paper>
          </Grid>

          {/* Bottom 5 */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              sx={{ color: "#D32F2F", mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              ⚠️ Needs Support
            </Typography>
            <Paper elevation={0} sx={{ bgcolor: "#FAFAFA", borderRadius: 2, p: 1 }}>
              {bottom.map((item, index) => (
                <RankItem key={index}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: "#FFCDD2",
                        color: "#C62828",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Typography variant="body2">{item.district}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: "#D32F2F" }}>
                    {item.averageScore}%
                  </Typography>
                </RankItem>
              ))}
            </Paper>
          </Grid>
        </Grid>

        {/* Footer - View Full Dashboard Button */}
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: "1px solid #EEF0F5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            📊 Semester 2 Assessment • {totalDistricts} Districts • {gradePerformance.length} Grades
          </Typography>

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/sat")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #e07be0 0%, #e0455a 100%)",
              },
            }}
          >
            View Full SAT Dashboard
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SATCard;
