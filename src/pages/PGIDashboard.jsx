import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import { Box, Typography } from "@mui/material";

const PGIDashboard = () => {
  return (
    <DashboardLayout>
      <Header />

      <Box sx={{ p: 3 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          color="primary"
        >
          📊 PGI 2.0 Dashboard
        </Typography>

        <Typography sx={{ mt: 1 }}>
          Performance Grading Index (PGI-D 2.0)
        </Typography>
      </Box>
    </DashboardLayout>
  );
};

export default PGIDashboard;