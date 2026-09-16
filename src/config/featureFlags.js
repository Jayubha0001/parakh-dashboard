// -----------------------------------------------------------------------
// Feature flags — simple on/off switches for sidebar tabs.
//
// HOW TO TURN A TAB BACK ON:
//   Change its value below from `false` to `true`, save the file, and
//   rebuild (`npm run build`) or restart the dev server (`npm run dev`).
//   The tab reappears in the sidebar in its usual position — nothing
//   else needs to change, and no code or data is deleted when a tab is
//   turned off, so this is fully reversible any time.
//
// HOW TO HIDE A TAB AGAIN:
//   Change it back to `false`.
//
// WHERE THIS FILE IS:
//   src/config/featureFlags.js
//   It's imported by src/components/Sidebar.jsx, which is the only file
//   that reads these flags.
// -----------------------------------------------------------------------

export const SHOW_ATTENDANCE_TAB = false;
export const SHOW_CRC_VISIT_TAB = false;
