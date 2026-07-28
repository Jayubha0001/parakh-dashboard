import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import Loading from "../components/Loading";
import CombinedBandSummary from "../components/CombinedBandSummary";
import CombinedRankingTable from "../components/CombinedRankingTable";
import DistrictRankingChart from "../charts/DistrictRankingChart";
import ActionItemsQueue from "../components/ActionItemsQueue";
import DistrictCompareView from "../components/DistrictCompareView";

import {
  loadExcel,
  loadSATSem1Excel,
  getCombinedRankingWithSAT,
  getComparisonActionItems,
  getAllDistrictNames,
  getAllDistrictComparisonActionItems,
  getPGICategoryHeatmap,
  getSheetData,
  getSATGradeWise,
  getSATSem1GradeWise,
} from "../services/dataService";

const Comparison = () => {
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState({ weights: {}, districts: [], bandSummary: [], bandSummaryWithSAT: [] });
  const [actionItems, setActionItems] = useState([]);
  const [allDistrictNames, setAllDistrictNames] = useState([]);
  const [allDistrictItems, setAllDistrictItems] = useState([]);
  const [districtA, setDistrictA] = useState("");
  const [districtB, setDistrictB] = useState("");
  const [pgiHeatmap, setPgiHeatmap] = useState({ categories: [], data: [] });
  const [parakhGradeWise, setParakhGradeWise] = useState([]);
  const [satGradeSem1, setSatGradeSem1] = useState({ grades: [], data: [] });
  const [satGradeSem2, setSatGradeSem2] = useState({ grades: [], data: [] });

  useEffect(() => {
    async function fetchData() {
      const [workbook, sem1Workbook] = await Promise.all([loadExcel(), loadSATSem1Excel()]);
      const combined = getCombinedRankingWithSAT(workbook, sem1Workbook);
      setRanking(combined);
      setActionItems(getComparisonActionItems(workbook, sem1Workbook));
      setAllDistrictNames(getAllDistrictNames(workbook));
      setAllDistrictItems(getAllDistrictComparisonActionItems(workbook, sem1Workbook));
      setPgiHeatmap(getPGICategoryHeatmap(workbook));
      setParakhGradeWise(getSheetData(workbook, "Dashboard_PARAKH"));
      setSatGradeSem1(getSATSem1GradeWise(sem1Workbook));
      setSatGradeSem2(getSATGradeWise(workbook));
      // District A/B start blank — nothing is picked until the user actually
      // picks it from the dropdown, instead of silently pre-selecting the
      // top two ranked districts.
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Header />
        <Loading message="Loading combined PGI-D + PARAKH + SAT ranking..." />
      </DashboardLayout>
    );
  }

  // Band distribution stays state-wide (33 districts) — it's a state-level
  // summary, not something that narrows with the district picker.
  //
  // The ranking chart, table, and action items below all narrow to
  // whichever two districts are picked in "Compare Two Districts" above —
  // that's now the single control for this page, so there's no second
  // filter here that could silently disagree with it.
  const compareDistricts = [districtA, districtB].filter(Boolean);
  const filteredDistricts = compareDistricts.length
    ? ranking.districts.filter((d) => compareDistricts.includes(d.District))
    : ranking.districts;

  return (
    <DashboardLayout>
      <Header />

      <DistrictCompareView
        districts={ranking.districts}
        districtA={districtA}
        districtB={districtB}
        onChangeDistrictA={setDistrictA}
        onChangeDistrictB={setDistrictB}
        pgiHeatmap={pgiHeatmap}
        parakhGradeWise={parakhGradeWise}
        satGradeSem1={satGradeSem1}
        satGradeSem2={satGradeSem2}
      />

      <CombinedBandSummary
        bandSummary={ranking.bandSummaryWithSAT}
        weights={ranking.weights}
      />

      <Box mt={4}>
        <DistrictRankingChart data={filteredDistricts} />
      </Box>

      <CombinedRankingTable data={filteredDistricts} />

      <ActionItemsQueue
        items={actionItems}
        allDistricts={allDistrictNames}
        allItems={allDistrictItems}
        focusDistricts={compareDistricts}
      />
    </DashboardLayout>
  );
};

export default Comparison;