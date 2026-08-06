// -----------------------------------------------------------------
// Live "CRC Visit" feed — apisma.ssgujarat.org
//
// This is a REMOTE, third-party government API (not the local Excel
// files the rest of the dashboard reads from), so it behaves
// differently in two important ways every consumer of this file should
// know about:
//
// 1. CORS: the API is not guaranteed to send back an
//    Access-Control-Allow-Origin header for this dashboard's domain.
//    If a direct browser fetch gets blocked with a CORS error in the
//    console, the fix is NOT in this file — it's routing the request
//    through a proxy so the browser talks to same-origin:
//      - Local dev (Vite): add a `server.proxy` entry in vite.config.js
//        for "/api" -> "https://apisma.ssgujarat.org", then set
//        API_BASE below to "" (relative).
//      - Production: add a rewrite/proxy route on whatever host you
//        deploy to (Vercel/Netlify rewrites, or a tiny serverless
//        function) that forwards /api/report/* to the real host.
//
// 2. The secretkey below is visible to anyone who opens devtools on the
//    deployed site — fine for an internal/government network tool, but
//    worth knowing if this page is ever exposed publicly.
// -----------------------------------------------------------------

const API_BASE = "https://apisma.ssgujarat.org";
const SECRET_KEY = "SSACTS17";

// Roles confirmed against a live sample: "crc". Other values (brc, deo...)
// are plausible given the naming but unconfirmed — kept here as a single
// place to extend once verified.
export const VISIT_ROLES = [{ value: "crc", label: "CRC (Cluster Resource Coordinator)" }];

// -----------------------------
// Test / dummy data exclusion
// -----------------------------
// Real districts use DistrictId 2401-2433 (33 Gujarat districts — see
// src/data/masterClusters.json, built from the official cluster master
// list). "2499" is outside that range and is a known QA/testing entry, so
// it — and anything else tagged as test data — must never be counted in
// any district-wise total.
//
// NOTE: we haven't yet seen a raw sample of the visit-details payload to
// confirm which exact field carries "2499" (DistrictId is the most likely
// place given the numbering pattern above). isTestEntry() checks every
// plausible field so the exclusion holds regardless of where it lands —
// but if district totals still look off after this, share one raw record
// from the API (Network tab) so this can be tightened to the exact field.
const TEST_DISTRICT_ID = 2499;

export const isTestEntry = (v) => {
  if (!v) return true;
  const candidates = [v.DistrictId, v.BlockId, v.ClusterId, v.ClusterCode, v.SchoolId];
  if (candidates.some((c) => Number(c) === TEST_DISTRICT_ID)) return true;
  const name = String(v.DistrictName || "").trim().toUpperCase();
  // Broad match on purpose: "TestDistrict", "TEST DISTRICT", "Test",
  // "Testing", "Dummy" etc. should all be caught, not just an exact
  // "TEST" — a real Gujarat district name will never contain "TEST".
  if (!name || name.includes("TEST") || name.includes("DUMMY")) return true;
  return false;
};

// Drop test/dummy records from a raw visit-details array. Always run
// fetched data through this before aggregating or displaying it.
export const excludeTestEntries = (visits) => (visits || []).filter((v) => !isTestEntry(v));

// SchoolStatus (and ClassStatus) values seen in the live feed, normalized
// into the three buckets the UI cares about.
export const STATUS_META = {
  FREEZED: { label: "Completed", color: "#1F8A70" }, // form submitted & locked
  INPROGRESS: { label: "In Progress", color: "#F0B429" },
  NOTVISITED: { label: "Not Visited", color: "#D32F2F" },
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

// -----------------------------
// Fetch
// -----------------------------

export const fetchVisitDetails = async (date = todayISO(), role = "crc") => {
  const url = `${API_BASE}/api/report/visit-details?date=${date}&role=${role}&secretkey=${SECRET_KEY}`;

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    // A network-level failure here (as opposed to a 4xx/5xx) is the
    // classic signature of a CORS block — the browser refuses to even
    // hand back a response object.
    throw new Error(
      "Could not reach the visit-details API. If this is a CORS error in the console, this request needs to go through a proxy (see the comment at the top of visitService.js)."
    );
  }

  if (!response.ok) {
    throw new Error(`Visit-details API returned ${response.status}`);
  }

  const payload = await response.json();

  if (!payload || payload.status !== true || !Array.isArray(payload.data)) {
    throw new Error("Unexpected response shape from visit-details API");
  }

  // Strip test/dummy entries (e.g. the "2499" QA code) right at the
  // source so nothing downstream — KPIs, district table, CRC list —
  // ever has to remember to do it.
  return excludeTestEntries(payload.data);
};

// -----------------------------
// Aggregation
// -----------------------------

const bucketStatus = (status) => (STATUS_META[status] ? status : "NOTVISITED");

export const getOverallStats = (visits) => {
  const total = visits.length;
  const counts = { FREEZED: 0, INPROGRESS: 0, NOTVISITED: 0 };

  visits.forEach((v) => {
    counts[bucketStatus(v.SchoolStatus)] += 1;
  });

  const completionRate = total ? (counts.FREEZED / total) * 100 : 0;

  return {
    total,
    completed: counts.FREEZED,
    inProgress: counts.INPROGRESS,
    notVisited: counts.NOTVISITED,
    completionRate,
  };
};

export const summarizeByDistrict = (visits) => {
  const byDistrict = {};

  visits.forEach((v) => {
    const key = v.DistrictName || "Unknown";
    if (!byDistrict[key]) {
      byDistrict[key] = { District: key, total: 0, completed: 0, inProgress: 0, notVisited: 0 };
    }
    byDistrict[key].total += 1;
    if (bucketStatus(v.SchoolStatus) === "FREEZED") byDistrict[key].completed += 1;
    else if (bucketStatus(v.SchoolStatus) === "INPROGRESS") byDistrict[key].inProgress += 1;
    else byDistrict[key].notVisited += 1;
  });

  return Object.values(byDistrict)
    .map((d) => ({ ...d, completionRate: d.total ? (d.completed / d.total) * 100 : 0 }))
    .sort((a, b) => b.completionRate - a.completionRate);
};

// -----------------------------------------------------------------
// Full district-wise report — matches the "Visit Statistics" table on
// sma.ssgujarat.org column-for-column:
//   District | Total Cluster | In Place | Vacant Count | Total Visit |
//   Visited | Visited (%) | Total Not Visited | Not Visited with
//   reason [broken down by reason] | Not Visited without reason |
//   Not Visited (%) | Freezed | Bagless Activity
//
// "Total Cluster" comes from the official cluster master list
// (src/data/masterClusters.json, generated from the CRC master Excel),
// NOT from the live feed — the live feed only ever tells us about
// clusters that actually have a CRC/visit record, which is exactly
// "In Place" below. Vacant = clusters on the master list with nobody
// assigned yet.
//
// Formula reproduces the screenshot's numbers exactly for every row
// checked (e.g. KACHCHH: cluster=180, inPlace=103, visited=48,
// visited%=46.6, notVisited=55, notVisited%=53.4).
// -----------------------------------------------------------------

// The fixed set of reason values the field app offers a CRC when they
// mark a school Not Visited (seen on the admin site's report). Anything
// that doesn't match one of these still counts toward "Not Visited with
// reason" — it just lands in "Other" instead of being lost.
export const REASON_CATEGORIES = [
  "Local Holiday",
  "MEETING",
  "On Duty",
  "On Leave",
  "Training/Workshop",
  "આનંદદાયી પ્રવૃત્તિઓ",
];

const matchReasonCategory = (reason) => {
  const r = String(reason || "").trim().toLowerCase();
  const hit = REASON_CATEGORIES.find((cat) => cat.toLowerCase() === r);
  return hit || "Other";
};

const emptyReasonCounts = () => {
  const counts = {};
  REASON_CATEGORIES.forEach((cat) => { counts[cat] = 0; });
  counts.Other = 0;
  return counts;
};

export const getDistrictReportRows = (visits, masterClusters) => {
  const masterByDistrict = {};
  (masterClusters?.districts || []).forEach((d) => {
    masterByDistrict[d.district] = d;
  });

  const makeEmptyRow = (key) => ({
    District: key,
    inPlace: 0,
    visited: 0,
    notVisitedWithReason: 0,
    notVisitedWithoutReason: 0,
    reasonCounts: emptyReasonCounts(),
    // Freezed / Bagless Activity: field names not yet confirmed
    // against a raw API sample. Counted only if present (see
    // hasFreezedField / hasBaglessField below) so the UI can show
    // "—" instead of a misleading 0 until confirmed.
    freezed: 0,
    baglessActivity: 0,
  });

  const byDistrict = {};

  // Seed every district on the official master list first, even ones
  // with zero visit records for the selected date/role. Without this,
  // a district that simply hasn't logged a visit yet today disappears
  // from the table entirely — and its Total Cluster count disappears
  // from the "Total Cluster" grand total along with it, which is why
  // that stat card used to undercount the master-list sum (e.g. 3156
  // instead of the true total). Total Cluster must always reflect the
  // full master list regardless of what's in the live feed.
  (masterClusters?.districts || []).forEach((d) => {
    byDistrict[d.district] = makeEmptyRow(d.district);
  });

  visits.forEach((v) => {
    const key = v.DistrictName || "Unknown";
    if (!byDistrict[key]) {
      byDistrict[key] = makeEmptyRow(key);
    }
    const row = byDistrict[key];
    row.inPlace += 1;

    const status = bucketStatus(v.SchoolStatus);
    if (status === "FREEZED") {
      row.visited += 1;
    } else if (v.Reason && String(v.Reason).trim()) {
      row.notVisitedWithReason += 1;
      row.reasonCounts[matchReasonCategory(v.Reason)] += 1;
    } else {
      row.notVisitedWithoutReason += 1;
    }

    // Best-effort: only counted if the field actually appears on the
    // record. Confirm the real field names once a raw sample is shared.
    if (v.Freezed === true || v.Freezed === 1 || v.IsFreezed === true) row.freezed += 1;
    if (v.BaglessActivity === true || v.IsBaglessActivity === true) row.baglessActivity += 1;
  });

  const sample = visits[0] || {};
  const hasFreezedField = ["Freezed", "IsFreezed"].some((k) => k in sample);
  const hasBaglessField = ["BaglessActivity", "IsBaglessActivity"].some((k) => k in sample);

  return Object.values(byDistrict)
    .map((row) => {
      const master = masterByDistrict[row.District];
      const totalCluster = master ? master.totalCluster : row.inPlace; // fallback if district isn't on the master list
      const vacant = Math.max(totalCluster - row.inPlace, 0);
      const totalVisit = row.inPlace;
      const totalNotVisited = row.notVisitedWithReason + row.notVisitedWithoutReason;

      return {
        district: row.District,
        totalCluster,
        inPlace: row.inPlace,
        vacantCount: vacant,
        totalVisit,
        visited: row.visited,
        visitedPct: totalVisit ? (row.visited / totalVisit) * 100 : 0,
        totalNotVisited,
        notVisitedWithReason: row.notVisitedWithReason,
        reasonCounts: row.reasonCounts,
        notVisitedWithoutReason: row.notVisitedWithoutReason,
        notVisitedPct: totalVisit ? (totalNotVisited / totalVisit) * 100 : 0,
        freezed: hasFreezedField ? row.freezed : null,
        baglessActivity: hasBaglessField ? row.baglessActivity : null,
      };
    })
    .sort((a, b) => a.district.localeCompare(b.district));
};

export const summarizeByBlock = (visits, districtName) => {
  const filtered = districtName && districtName !== "All"
    ? visits.filter((v) => v.DistrictName === districtName)
    : visits;

  const byBlock = {};

  filtered.forEach((v) => {
    const key = v.BlockName || "Unknown";
    if (!byBlock[key]) {
      byBlock[key] = { Block: key, District: v.DistrictName, total: 0, completed: 0, inProgress: 0, notVisited: 0 };
    }
    byBlock[key].total += 1;
    if (bucketStatus(v.SchoolStatus) === "FREEZED") byBlock[key].completed += 1;
    else if (bucketStatus(v.SchoolStatus) === "INPROGRESS") byBlock[key].inProgress += 1;
    else byBlock[key].notVisited += 1;
  });

  return Object.values(byBlock)
    .map((b) => ({ ...b, completionRate: b.total ? (b.completed / b.total) * 100 : 0 }))
    .sort((a, b) => b.completionRate - a.completionRate);
};

// Block-level version of getDistrictReportRows — same columns, one row
// per (District, Block), so a district's blocks can be compared the
// same way the districts themselves are compared. Total Cluster again
// comes from the master list (masterClusters.blocks), not the live feed.
export const getBlockReportRows = (visits, masterClusters, districtName) => {
  const filtered = districtName && districtName !== "All"
    ? visits.filter((v) => v.DistrictName === districtName)
    : visits;

  const masterByBlock = {};
  (masterClusters?.blocks || []).forEach((b) => {
    masterByBlock[`${b.district}||${b.block}`] = b;
  });

  const makeEmptyBlockRow = (dKey, bKey) => ({
    District: dKey,
    Block: bKey,
    inPlace: 0,
    visited: 0,
    notVisitedWithReason: 0,
    notVisitedWithoutReason: 0,
  });

  const byBlock = {};

  // Same reasoning as getDistrictReportRows above: seed every block on
  // the master list (optionally scoped to the selected district) so a
  // block with zero visits today still contributes its Total Cluster
  // count to the total instead of vanishing.
  (masterClusters?.blocks || []).forEach((b) => {
    if (districtName && districtName !== "All" && b.district !== districtName) return;
    byBlock[`${b.district}||${b.block}`] = makeEmptyBlockRow(b.district, b.block);
  });

  filtered.forEach((v) => {
    const dKey = v.DistrictName || "Unknown";
    const bKey = v.BlockName || "Unknown";
    const key = `${dKey}||${bKey}`;
    if (!byBlock[key]) {
      byBlock[key] = makeEmptyBlockRow(dKey, bKey);
    }
    const row = byBlock[key];
    row.inPlace += 1;

    const status = bucketStatus(v.SchoolStatus);
    if (status === "FREEZED") {
      row.visited += 1;
    } else {
      if (v.Reason && String(v.Reason).trim()) row.notVisitedWithReason += 1;
      else row.notVisitedWithoutReason += 1;
    }
  });

  return Object.values(byBlock)
    .map((row) => {
      const master = masterByBlock[`${row.District}||${row.Block}`];
      const totalCluster = master ? master.totalCluster : row.inPlace;
      const vacant = Math.max(totalCluster - row.inPlace, 0);
      const totalVisit = row.inPlace;
      const totalNotVisited = row.notVisitedWithReason + row.notVisitedWithoutReason;

      return {
        district: row.District,
        block: row.Block,
        totalCluster,
        inPlace: row.inPlace,
        vacantCount: vacant,
        totalVisit,
        visited: row.visited,
        visitedPct: totalVisit ? (row.visited / totalVisit) * 100 : 0,
        totalNotVisited,
        notVisitedWithReason: row.notVisitedWithReason,
        notVisitedWithoutReason: row.notVisitedWithoutReason,
        notVisitedPct: totalVisit ? (totalNotVisited / totalVisit) * 100 : 0,
      };
    })
    .sort((a, b) => a.district.localeCompare(b.district) || a.block.localeCompare(b.block));
};

// Grand-total row for getDistrictReportRows — sums every numeric column
// across all districts and recomputes the two percentages from those
// sums (never averages percentages).
export const getDistrictReportTotals = (rows) => {
  const totals = rows.reduce(
    (acc, r) => {
      acc.totalCluster += r.totalCluster;
      acc.inPlace += r.inPlace;
      acc.vacantCount += r.vacantCount;
      acc.totalVisit += r.totalVisit;
      acc.visited += r.visited;
      acc.totalNotVisited += r.totalNotVisited;
      acc.notVisitedWithReason += r.notVisitedWithReason;
      acc.notVisitedWithoutReason += r.notVisitedWithoutReason;
      REASON_CATEGORIES.concat("Other").forEach((cat) => {
        acc.reasonCounts[cat] = (acc.reasonCounts[cat] || 0) + (r.reasonCounts?.[cat] || 0);
      });
      if (r.freezed !== null) acc.freezed = (acc.freezed || 0) + r.freezed;
      if (r.baglessActivity !== null) acc.baglessActivity = (acc.baglessActivity || 0) + r.baglessActivity;
      return acc;
    },
    {
      totalCluster: 0, inPlace: 0, vacantCount: 0, totalVisit: 0, visited: 0,
      totalNotVisited: 0, notVisitedWithReason: 0, notVisitedWithoutReason: 0,
      reasonCounts: emptyReasonCounts(),
      freezed: null, baglessActivity: null,
    }
  );

  totals.visitedPct = totals.totalVisit ? (totals.visited / totals.totalVisit) * 100 : 0;
  totals.notVisitedPct = totals.totalVisit ? (totals.totalNotVisited / totals.totalVisit) * 100 : 0;
  return totals;
};

export const getAllDistrictNamesFromVisits = (visits) => {
  const names = [...new Set(visits.map((v) => v.DistrictName).filter(Boolean))];
  return ["All", ...names.sort()];
};

// CRC Monitoring list — a by-name view of every CRC who hasn't
// completed their visit yet (In Progress or Not Visited), for follow-up
// calls. Sorted so Not Visited (most urgent) comes first, then In
// Progress, each alphabetically by name within that.
export const getCRCMonitoringList = (visits, districtName) => {
  const filtered = districtName && districtName !== "All"
    ? visits.filter((v) => v.DistrictName === districtName)
    : visits;

  const order = { NOTVISITED: 0, INPROGRESS: 1 };

  return filtered
    .filter((v) => bucketStatus(v.SchoolStatus) !== "FREEZED")
    .map((v) => ({
      name: v.FullName || "Unknown",
      mobile: v.MobileNumber || "—",
      district: v.DistrictName,
      block: v.BlockName,
      cluster: v.ClusterName,
      school: v.SchoolName,
      status: bucketStatus(v.SchoolStatus),
      reason: v.Reason || "",
    }))
    .sort((a, b) => {
      const statusDiff = order[a.status] - order[b.status];
      return statusDiff !== 0 ? statusDiff : a.name.localeCompare(b.name);
    });
};

// Free-text search across CRC name, cluster, block, school.
export const searchVisits = (visits, query) => {
  if (!query || !query.trim()) return visits;
  const q = query.trim().toLowerCase();

  return visits.filter((v) =>
    [v.FullName, v.ClusterName, v.BlockName, v.SchoolName, v.DistrictName, v.UserName]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q))
  );
};
