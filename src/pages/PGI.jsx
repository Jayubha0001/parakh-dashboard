import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import PGIKPICards from "../components/PGIKPICards";
import PGIDomainCards from "../components/PGIDomainCards";
import PGITable from "../components/PGITable";
import PGIRankingChart from "../charts/PGIRankingChart";
import HeatMapChart from "../charts/HeatMapChart";
import Loading from "../components/Loading";
import DistrictFilterBar from "../components/DistrictFilterBar";
import ActionItemsQueue from "../components/ActionItemsQueue";
import { PGIIndicatorSection } from "../components/DistrictDeepDive";
import { Card, CardContent, Typography } from "@mui/material";

import {
  loadExcel,
  getStatePGISummary,
  getDistrictPGIRanking,
  getPGICategoryHeatmap,
  getPGIActionItems,
  getAllDistrictNames,
  getAllDistrictPGIActionItems,
  getDistrictPGIIndicators,
} from "../services/dataService";

const PGI = () => {
  const [loading, setLoading] = useState(true);
  const [stateSummary, setStateSummary] = useState({ domains: [], overall: {} });
  const [districtRanking, setDistrictRanking] = useState([]);
  const [heatmap, setHeatmap] = useState({ categories: [], data: [] });
  const [district, setDistrict] = useState("All");
  const [actionItems, setActionItems] = useState([]);
  const [allDistrictNames, setAllDistrictNames] = useState([]);
  const [allDistrictItems, setAllDistrictItems] = useState([]);
  const [districtIndicators, setDistrictIndicators] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const workbook = await loadExcel();

      setStateSummary(getStatePGISummary(workbook));
      setDistrictRanking(getDistrictPGIRanking(workbook));
      setHeatmap(getPGICategoryHeatmap(workbook));
      setActionItems(getPGIActionItems(workbook));
      setAllDistrictNames(getAllDistrictNames(workbook));
      setAllDistrictItems(getAllDistrictPGIActionItems(workbook));

      setLoading(false);
    }

    fetchData();
  }, []);

  // Full 70-indicator breakdown for whichever district is picked in the
  // filter bar above — loadExcel() is cached, so this is cheap even though
  // it looks like a second load.
  useEffect(() => {
    if (district === "All") {
      setDistrictIndicators(null);
      return;
    }
    let cancelled = false;
    loadExcel().then((workbook) => {
      if (!cancelled) setDistrictIndicators(getDistrictPGIIndicators(workbook, district));
    });
    return () => {
      cancelled = true;
    };
  }, [district]);

  const sortedByScore = [...districtRanking].sort(
    (a, b) => b.PercentAchieved - a.PercentAchieved
  );

  const topDistrict = sortedByScore[0];
  const lowestDistrict = sortedByScore[sortedByScore.length - 1];

  const districts = ["All", ...new Set(districtRanking.map((d) => d.District))];

  // Ranking table / chart / heat-map narrow to the selected district;
  // the state-level KPI cards above stay state-wide as a fixed reference.
  const filteredRanking =
    district === "All"
      ? districtRanking
      : districtRanking.filter((d) => d.District === district);

  const filteredSorted = [...filteredRanking].sort(
    (a, b) => b.PercentAchieved - a.PercentAchieved
  );

  const filteredHeatmapData =
    district === "All"
      ? heatmap.data
      : heatmap.data.filter((d) => d.District === district);

  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header
        pageIcon="🏛️"
        pageEyebrow="Performance Grading Index — State & District"
        pageTitle="Gujarat PGI 2.0 Dashboard"
        pageSubtitle="6 Domains · 33 Districts · Scored out of 1000 (State) / 600 (District)"
        statChip={{
          label: "Gujarat State Overall Score",
          value: stateSummary.overall?.score?.toFixed(1) ?? "-",
          suffix: `/ ${stateSummary.overall?.maxWeight ?? 1000}`,
          badge: `${stateSummary.overall?.grade || "-"} · ${stateSummary.overall?.percentAchieved?.toFixed(1) ?? 0}%`,
        }}
      />

      <PGIKPICards
        overall={stateSummary.overall}
        totalDistricts={districtRanking.length}
        topDistrict={topDistrict}
        lowestDistrict={lowestDistrict}
      />

      <PGIDomainCards domains={stateSummary.domains} />

      <Box mt={4}>
        <DistrictFilterBar
          district={district}
          setDistrict={setDistrict}
          districts={districts}
        />
      </Box>

      <Box mt={1}>
        <PGIRankingChart data={filteredSorted} />
      </Box>

      <PGITable data={filteredSorted} />

      <HeatMapChart categories={heatmap.categories} data={filteredHeatmapData} allData={heatmap.data} />

      {district !== "All" && districtIndicators?.overall && (
        <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 4, border: "1px solid #E4E7F0" }} elevation={0}>
          <CardContent>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
              🔎 {district} — Full Indicator Breakdown (70 Indicators)
            </Typography>
            <PGIIndicatorSection
              indicators={districtIndicators.indicators}
              domainSummary={districtIndicators.domainSummary}
              overall={districtIndicators.overall}
            />
          </CardContent>
        </Card>
      )}

      <ActionItemsQueue
        items={actionItems}
        allDistricts={allDistrictNames}
        allItems={allDistrictItems}
        syncDistrict={district}
      />
    </DashboardLayout>
  );
};

export default PGI;