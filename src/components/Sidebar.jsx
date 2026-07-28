import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";

import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { colors } from "../theme/theme";

const drawerWidth = 240;

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/",
  },
  {
    text: "PARAKH",
    icon: <SchoolIcon />,
    path: "/parakh",
  },
  {
    text: "PGI 2.0",
    icon: <AssessmentIcon />,
    path: "/pgi",
  },
  {
    text: "SAT",
    icon: <FactCheckIcon />,
    path: "/sat",
  },
  {
    text: "Comparison",
    icon: <EmojiEventsIcon />,
    path: "/comparison",
  },
  {
    text: "PM Shri",
    icon: <AccountBalanceIcon />,
    path: "/pmshri",
  },
  {
    text: "Reports",
    icon: <DescriptionIcon />,
    path: "/reports",
  },
];

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          background: colors.navy,
          color: "white",
          borderRight: "none",
        },
      }}
    >
      <Toolbar sx={{ gap: 1.2 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
          }}
        />
        <Typography
          sx={{
            fontFamily: '"Fraunces", serif',
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: 0.3,
          }}
        >
          PARAKH
        </Typography>
      </Toolbar>

      <List sx={{ px: 1.5 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{
                color: "rgba(255,255,255,0.85)",
                textDecoration: "none",
                borderRadius: 2,
                pl: 1.5,
                transition: "background-color 0.15s ease, color 0.15s ease",
                outline: "none",

                "&.active": {
                  backgroundColor: "rgba(240,180,41,0.14)",
                  color: "#fff",
                  fontWeight: 600,
                  borderLeft: `3px solid ${colors.gold}`,
                  pl: "9px",
                },

                "&.active .MuiListItemIcon-root": {
                  color: colors.goldLight,
                },

                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.06)",
                },

                // Keyboard/click focus should read as "gold", the app's own
                // accent, rather than the browser's default blue ring.
                "&:focus, &:focus-visible": {
                  outline: "none",
                  boxShadow: `inset 0 0 0 1px ${colors.gold}`,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;