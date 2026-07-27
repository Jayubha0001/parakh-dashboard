import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

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
          background: "#0F172A",
          color: "white",
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" fontWeight="bold">
          PARAKH
        </Typography>
      </Toolbar>

      <List>
  {menuItems.map((item) => (
    <ListItem key={item.text} disablePadding>

      <ListItemButton
        component={NavLink}
        to={item.path}
        sx={{
          color: "white",
          textDecoration: "none",

          "&.active": {
            backgroundColor: "#1976d2",
            borderLeft: "5px solid #FFD54F",
          },

          "&:hover": {
            backgroundColor: "#1E293B",
          },
        }}
      >

        <ListItemIcon
          sx={{
            color: "white",
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