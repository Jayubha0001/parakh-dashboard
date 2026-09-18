// Translation dictionary for the EN / ગુજરાતી toggle.
//
// Scope, honestly: this covers the navigation sidebar and the shared
// District Filter / District Snapshot panel widgets that repeat on every
// page — the highest-traffic UI a person sees regardless of which page
// they're on. It does NOT (yet) translate every chart label, table
// header, and paragraph across all 9 pages — that's a much larger job
// (thousands of individual strings across ~20 files). Add more keys here
// and wrap more strings with t('key') to extend coverage.
//
// Official scheme/exam names (PARAKH, PGI 2.0, SAT, PM Shri, GSQAC, CRC)
// are kept as-is in both languages, matching how they're written in
// Gujarat School Education Department's own Gujarati materials.

export const translations = {
  en: {
    // Sidebar navigation
    nav_dashboard: "Dashboard",
    nav_parakh: "PARAKH",
    nav_pgi: "PGI 2.0",
    nav_sat: "SAT",
    nav_pmshri: "PM Shri",
    nav_attendance: "Attendance",
    nav_crc_visit: "CRC Visit",
    nav_comparison: "Comparison",
    nav_reports: "Reports",

    // District Filter bar (shared across PARAKH / PGI / SAT / PM Shri)
    district_label: "District",
    all_districts: "All Districts",
    priority_districts_only: "Priority Districts Only",
    reset: "Reset",

    // District / Executive Snapshot panel (shared)
    districts_covered: "Districts Covered",
    priority_vs_other: "Priority",
    other_districts: "Other",
    select_on_map: "Select on map",
    state_average: "State Average",

    // PARAKH Competency section (DistrictDeepDive.jsx) — the "Stage &
    // Subject" accordion + competency table + Action Points callout,
    // shown on the PARAKH page and on Reports. Note: the competency
    // wording itself (e.g. "Applies varied comprehension strategies…")
    // and subject names (Language, Mathematics, …) come from the
    // assessment data/workbook, not from this file, so they stay in
    // whichever language the source data was entered in — translating
    // that curriculum-level wording accurately needs the department's
    // own official Gujarati text, not a guess.
    stage_and_subject: "Stage & Subject",
    stage_foundational: "Foundational (Grade 3)",
    stage_preparatory: "Preparatory (Grade 6)",
    stage_middle: "Middle (Grade 9)",
    competency: "Competency",
    national_pct: "National %",
    district_pct: "District %",
    gap: "Gap",
    avg: "Avg",
    weak: "Weak",
    action_points_weakest_competencies: "Action Points — Weakest Competencies",
    action_points_competencies_note:
      "Every {subject} competency below is either under 45% or at least 3 points behind the national benchmark — in order from weakest to least-weak.",
    currently: "currently",
    vs_national: "vs national",
    gap_suffix: "gap",

    // PGI-D indicator breakdown
    category: "Category",
    domain: "Domain",
    indicator: "Indicator",
    score: "Score",

    // SAT Learning-Outcome breakdown
    lo_code: "LO Code",
    learning_outcome: "Learning Outcome",
    action_points_weakest_los: "Action Points — Weakest Learning Outcomes",
    action_points_los_note:
      "Every Learning Outcome below is under 45% — the specific SAT lines dragging this district's subject scores down, weakest first.",
    needs_targeted_push: "Needs a targeted push before the next assessment cycle.",
    no_lo_data: "No Learning-Outcome level data available for this district.",
  },
  gu: {
    nav_dashboard: "ડેશબોર્ડ",
    nav_parakh: "PARAKH",
    nav_pgi: "PGI 2.0",
    nav_sat: "SAT",
    nav_pmshri: "PM Shri",
    nav_attendance: "હાજરી",
    nav_crc_visit: "CRC મુલાકાત",
    nav_comparison: "સરખામણી",
    nav_reports: "અહેવાલો",

    district_label: "જિલ્લો",
    all_districts: "બધા જિલ્લા",
    priority_districts_only: "માત્ર પ્રાયોરિટી જિલ્લા",
    reset: "રીસેટ",

    districts_covered: "આવરી લેવાયેલા જિલ્લા",
    priority_vs_other: "પ્રાયોરિટી",
    other_districts: "અન્ય",
    select_on_map: "નકશા પર પસંદ કરો",
    state_average: "રાજ્ય સરેરાશ",

    stage_and_subject: "તબક્કો અને વિષય",
    stage_foundational: "ફાઉન્ડેશનલ (ધોરણ 3)",
    stage_preparatory: "પ્રિપરેટરી (ધોરણ 6)",
    stage_middle: "મિડલ (ધોરણ 9)",
    competency: "ક્ષમતા",
    national_pct: "રાષ્ટ્રીય %",
    district_pct: "જિલ્લા %",
    gap: "તફાવત",
    avg: "સરેરાશ",
    weak: "નબળું",
    action_points_weakest_competencies: "એક્શન પોઈન્ટ્સ — સૌથી નબળી ક્ષમતાઓ",
    action_points_competencies_note:
      "નીચેની દરેક {subject} ક્ષમતા 45% થી ઓછી છે અથવા રાષ્ટ્રીય બેન્ચમાર્ક કરતાં ઓછામાં ઓછી 3 પોઈન્ટ પાછળ છે — સૌથી નબળીથી ઓછી નબળી ક્રમમાં.",
    currently: "હાલમાં",
    vs_national: "રાષ્ટ્રીય સામે",
    gap_suffix: "તફાવત",

    category: "કેટેગોરી",
    domain: "ડોમેન",
    indicator: "ઈન્ડિકેટર",
    score: "સ્કોર",

    lo_code: "LO કોડ",
    learning_outcome: "લર્નિંગ આઉટકમ",
    action_points_weakest_los: "એક્શન પોઈન્ટ્સ — સૌથી નબળા લર્નિંગ આઉટકમ",
    action_points_los_note:
      "નીચેના દરેક લર્નિંગ આઉટકમ 45% થી ઓછા છે — આ જિલ્લાના વિષય સ્કોરને નીચે ખેંચતી ચોક્કસ SAT લાઈનો, સૌથી નબળીથી શરૂ કરીને.",
    needs_targeted_push: "આગલા એસેસમેન્ટ સાયકલ પહેલાં ખાસ ધ્યાન આપવાની જરૂર છે.",
    no_lo_data: "આ જિલ્લા માટે લર્નિંગ-આઉટકમ સ્તરનો ડેટા ઉપલબ્ધ નથી.",
  },
};
