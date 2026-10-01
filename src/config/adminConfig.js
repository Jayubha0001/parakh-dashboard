// -----------------------------------------------------------------------
// ADMIN PASSWORD for Settings -> "Manage Tabs (Admin)".
//
// Change the value below in VS Code, save, and the dev server reloads.
// (For a deployed site, rebuild with `npm run build` and re-upload.)
//
// Note: this is a soft lock for a static site. The password ships inside
// the JavaScript bundle, so it stops casual viewers but is not real security.
// -----------------------------------------------------------------------
export const ADMIN_PASSWORD = "Tank@2550";

// -----------------------------------------------------------------------
// DEFAULT TABS: which sidebar tabs show for anyone who has NOT changed
// them in Settings on their own browser. Set true/false, save, rebuild.
// (Settings -> Manage Tabs saves per browser and overrides these.)
// -----------------------------------------------------------------------
export const DEFAULT_TAB_FLAGS = {
  dashboard: true,
  parakh: true,
  pgi: true,
  sat: true,
  pmshri: true,
  insights: true,
  attendance: false,
  crcVisit: false,
  reports: false,
  comparison: false,
  dataDownload: false,
  // Dashboard sections
  dash_kpis: true, dash_kpiCounts: false, dash_map: true, dash_donut: true, dash_priorityVsOther: true,
  dash_breakdown: true, dash_priorityList: true, dash_weakest: true, dash_deepDive: true,
  // Dashboard comparison cards
  cmp_pgi: true, cmp_sat: true, cmp_pmshri: true,
  // Assessment dropdown options
  as_overall: true, as_pgi: true, as_parakh: true, as_sat: true,
  // Program pages
  pg_snapshot: true, pg_actions: true,
};
