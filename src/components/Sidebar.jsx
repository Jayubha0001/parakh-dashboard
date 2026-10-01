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
import BarChartIcon from "@mui/icons-material/BarChart";
import DownloadIcon from "@mui/icons-material/Download";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import { colors } from "../theme/theme";
import { useFeatureFlags } from "../config/FeatureFlagsContext";
import { useLanguage } from "../i18n/LanguageContext";

export const DRAWER_WIDTH = 240;
export const DRAWER_WIDTH_COLLAPSED = 68;

const menuItems = [
  {
    text: "Dashboard",
    textKey: "nav_dashboard",
    icon: <DashboardIcon />,
    path: "/",
    color: "#5AA6EA",
  },
  {
    text: "PARAKH",
    textKey: "nav_parakh",
    icon: <SchoolIcon />,
    path: "/parakh",
    color: "#3FB897",
  },
  {
    text: "PGI 2.0",
    textKey: "nav_pgi",
    icon: <AssessmentIcon />,
    path: "/pgi",
    color: "#B18CE8",
  },
  {
    text: "SAT",
    textKey: "nav_sat",
    icon: <FactCheckIcon />,
    path: "/sat",
    color: "#F0B429",
  },
  {
    text: "PM Shri",
    textKey: "nav_pmshri",
    icon: <AccountBalanceIcon />,
    path: "/pmshri",
    color: "#4DB6E5",
  },
  {
    text: "Attendance",
    textKey: "nav_attendance",
    icon: <BarChartIcon />,
    path: "/attendance",
    color: "#F2994A",
  },
  {
    text: "CRC Visit",
    textKey: "nav_crc_visit",
    icon: <PlaceIcon />,
    path: "/live-visits",
    color: "#E5737E",
  },
  {
    text: "Comparison",
    textKey: "nav_comparison",
    icon: <EmojiEventsIcon />,
    path: "/comparison",
    color: "#F2994A",
  },
  {
    text: "Reports",
    textKey: "nav_reports",
    icon: <DescriptionIcon />,
    path: "/reports",
    color: "#9AA5B1",
  },
  {
    text: "Data Download",
    textKey: "nav_data_download",
    icon: <DownloadIcon />,
    path: "/data-download",
    color: "#4DB6E5",
  },
  {
    text: "Key Insights",
    textKey: "nav_insights",
    icon: <LightbulbIcon />,
    path: "/insights",
    color: "#F0B429",
  },
];

// Settings is pinned to the very bottom of the rail, visually separated
// from the page tabs above it — it's a utility/account-style entry, not
// another data page, so it doesn't belong in the same scrolling list.
const settingsItem = {
  text: "Settings",
  textKey: "nav_settings",
  icon: <SettingsIcon />,
  path: "/settings",
  color: "#9AA5B1",
};

// Which menu items a feature flag governs (see FeatureFlagsContext) —
// looked up by path so toggling a flag in Settings shows/hides the tab
// immediately, with no code edit needed.
const FLAG_BY_PATH = {
  "/": "dashboard",
  "/parakh": "parakh",
  "/pgi": "pgi",
  "/sat": "sat",
  "/pmshri": "pmshri",
  "/insights": "insights",
  "/attendance": "attendance",
  "/live-visits": "crcVisit",
  "/reports": "reports",
  "/comparison": "comparison",
  "/data-download": "dataDownload",
};

// Shared list markup, rendered inside BOTH the permanent (desktop) drawer
// and the temporary (mobile, overlay) drawer below — one source of truth
// for the menu items and their styling. `collapsed` (desktop only) hides
// the text labels down to an icon rail, and `onToggleCollapse` renders the
// expand/collapse chevron in place of the old plain "PARAKH" brand text.
const DrawerContent = ({ onNavigate, collapsed = false, onToggleCollapse = null }) => {
  const { t } = useLanguage();
  const { flags } = useFeatureFlags();

  // Tabs behind a feature flag are simply left out of this list — the
  // flag itself now lives in Settings (admin-gated), not a file you have
  // to go edit in code.
  const visibleMenuItems = menuItems.filter((item) => {
    const flagKey = FLAG_BY_PATH[item.path];
    return flagKey ? flags[flagKey] : true;
  });

  const renderItem = (item) => {
    const label = t(item.textKey);
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

        {!collapsed && <ListItemText primary={label} />}
      </ListItemButton>
    );

    return (
      <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
        {collapsed ? (
          <Tooltip title={label} placement="right">
            <Box sx={{ width: "100%" }}>{button}</Box>
          </Tooltip>
        ) : (
          button
        )}
      </ListItem>
    );
  };

  return (
  <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <Toolbar sx={{ justifyContent: onToggleCollapse ? "flex-end" : "flex-start", px: collapsed ? 1 : 2 }}>
      {onToggleCollapse && (
        <Tooltip title={collapsed ? "Expand menu" : "Collapse menu"} placement="right">
          <IconButton
            onClick={onToggleCollapse}
            size="small"
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            sx={{
              color: "#2DD4BF",
              border: "1px solid rgba(45,212,191,0.35)",
              borderRadius: 1.5,
              p: 0.5,
              "&:hover": { backgroundColor: "rgba(45,212,191,0.12)" },
            }}
          >
            {collapsed ? <MenuIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>

    {/* Reach to Teach Foundation — the partner org this dashboard was
        built for/with, shown up top the way the original design had it,
        centred either way. Hidden in the collapsed icon-rail state since
        the logo bakes in the "Reach to Teach FOUNDATION" wordmark, which
        isn't legible at that width anyway. */}
    {!collapsed && (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", px: 2, mb: 1.5, mt: 0.5 }}>
        <Box
          component="img"
          src="/logo-reach-to-teach.png"
          alt="Reach to Teach Foundation"
          sx={{
            display: "block",
            width: 150,
            height: "auto",
            objectFit: "contain",
          }}
        />
      </Box>
    )}

    <List sx={{ px: collapsed ? 0.75 : 1.5, flex: 1 }}>{visibleMenuItems.map(renderItem)}</List>

    {/* Settings — pinned to the bottom, separated by a divider line, the
        way an account/utility entry usually sits apart from page tabs. */}
    <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", px: collapsed ? 0.75 : 1.5, py: 1 }}>
      {renderItem(settingsItem)}
    </Box>
  </Box>
  );
};

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
          // No width transition here on purpose: animating this width
          // forces the flex-1 main content area to resize on every
          // animation frame for ~0.2s, and every chart on the page
          // (there can be a dozen+ recharts ResponsiveContainers on the
          // heavier pages) re-measures on each of those resizes — that's
          // what made the collapse button feel like it froze the page.
          // An instant width change fires one resize instead of many.
          "& .MuiDrawer-paper": {
            width,
            background: colors.navy,
            color: "white",
            borderRight: "none",
            overflowX: "hidden",
          },
        }}
      >
        <DrawerContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      </Drawer>
    </>
  );
};

export default Sidebar;