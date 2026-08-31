import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./Sidebar";
import { colors } from "../theme/theme";

const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        className="dashboard-main-content"
        sx={{
          flex: 1,
          minWidth: 0,
          bgcolor: "#f4f7fc",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        {/* Mobile-only top bar — hamburger opens the overlay drawer.
            Hidden on md+ where the sidebar is always visible. */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 1,
            bgcolor: colors.navy,
            color: "#fff",
            position: "sticky",
            top: 0,
            zIndex: 1100,
          }}
        >
          <IconButton onClick={() => setMobileOpen(true)} size="small" sx={{ color: "#fff" }}>
            <MenuIcon />
          </IconButton>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
            }}
          />
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 16 }}>
            PARAKH
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 1.25, sm: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;