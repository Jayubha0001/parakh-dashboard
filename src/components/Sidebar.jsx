import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  IconButton,
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
import PlaceIcon from "@mui/icons-material/Place";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { colors } from "../theme/theme";

export const DRAWER_WIDTH = 240;
export const DRAWER_WIDTH_COLLAPSED = 68;

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/",
    color: "#5AA6EA",
  },
  {
    text: "PARAKH",
    icon: <SchoolIcon />,
    path: "/parakh",
    color: "#3FB897",
  },
  {
    text: "PGI 2.0",
    icon: <AssessmentIcon />,
    path: "/pgi",
    color: "#B18CE8",
  },
  {
    text: "SAT",
    icon: <FactCheckIcon />,
    path: "/sat",
    color: "#F0B429",
  },
  {
    text: "Comparison",
    icon: <EmojiEventsIcon />,
    path: "/comparison",
    color: "#F2994A",
  },
  {
    text: "PM Shri",
    icon: <AccountBalanceIcon />,
    path: "/pmshri",
    color: "#4DB6E5",
  },
  {
    text: "CRC Visit",
    icon: <PlaceIcon />,
    path: "/live-visits",
    color: "#E5737E",
  },
  {
    text: "Reports",
    icon: <DescriptionIcon />,
    path: "/reports",
    color: "#9AA5B1",
  },
];

// Shared list markup, rendered inside BOTH the permanent (desktop) drawer
// and the temporary (mobile, overlay) drawer below — one source of truth
// for the menu items and their styling. `collapsed` (desktop only) hides
// the text labels down to an icon rail, and `onToggleCollapse` renders the
// expand/collapse chevron in place of the old plain "PARAKH" brand text.
const DrawerContent = ({ onNavigate, collapsed = false, onToggleCollapse = null }) => (
  <>
    <Toolbar sx={{ justifyContent: onToggleCollapse ? "flex-end" : "flex-start", px: collapsed ? 1 : 2 }}>
      {onToggleCollapse && (
        <IconButton onClick={onToggleCollapse} size="small" sx={{ color: "rgba(255,255,255,0.75)" }}>
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      )}
    </Toolbar>

    <List sx={{ px: collapsed ? 0.75 : 1.5 }}>
      {menuItems.map((item) => {
        const button = (
          <ListItemButton
            component={NavLink}
            to={item.path}
            onClick={onNavigate}
            sx={{
              color: "rgba(255,255,255,0.85)",
              textDecoration: "none",
              borderRadius: 2,
              pl: collapsed ? 1.1 : 1.5,
              justifyContent: collapsed ? "center" : "flex-start",
              transition: "background-color 0.15s ease, color 0.15s ease",
              outline: "none",

              "&.active": {
                backgroundColor: "rgba(240,180,41,0.14)",
                color: "#fff",
                fontWeight: 600,
                borderLeft: collapsed ? "none" : `3px solid ${colors.gold}`,
                pl: collapsed ? 1.1 : "9px",
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
                color: item.color,
                minWidth: collapsed ? 0 : 40,
                opacity: 0.9,
                justifyContent: "center",
                "& .MuiSvgIcon-root": { fontSize: 21 },
              }}
            >
              {item.icon}
            </ListItemIcon>

            {!collapsed && <ListItemText primary={item.text} />}
          </ListItemButton>
        );

        return (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            {collapsed ? (
              <Tooltip title={item.text} placement="right">
                <Box sx={{ width: "100%" }}>{button}</Box>
              </Tooltip>
            ) : (
              button
            )}
          </ListItem>
        );
      })}
    </List>
  </>
);

// Permanent drawer on desktop (md+, collapsible to an icon rail via the
// chevron button), temporary overlay drawer on mobile (xs/sm) that opens
// via the hamburger button in DashboardLayout and closes itself on
// backdrop click or on picking a menu item.
const Sidebar = ({ mobileOpen = false, onClose = () => {}, collapsed = false, onToggleCollapse = () => {} }) => {
  const width = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            background: colors.navy,
            color: "white",
            borderRight: "none",
          },
        }}
      >
        <DrawerContent onNavigate={onClose} />
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width,
          transition: "width 0.2s ease",
          "& .MuiDrawer-paper": {
            width,
            background: colors.navy,
            color: "white",
            borderRight: "none",
            overflowX: "hidden",
            transition: "width 0.2s ease",
          },
        }}
      >
        <DrawerContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      </Drawer>
    </>
  );
};

export default Sidebar;