import { Box } from "@mui/material";
import Sidebar from "./Sidebar";

const drawerWidth = 240;

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Sidebar />

      <Box
  component="main"
  sx={{
    flex: 1,
    p: 3,
    bgcolor: "#f4f7fc",
    minHeight: "100vh",
    overflowX: "hidden",
  }}
>
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;