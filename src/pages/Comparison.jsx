import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import Loading from "../components/Loading";
import CombinedBandSummary from "../components/CombinedBandSummary";
import CombinedRankingTable from "../components/CombinedRankingTable";
import DistrictRankingChart from "../charts/DistrictRankingChart";
import DistrictFilterBar from "../components/DistrictFilterBar";
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
  const [district, setDistrict] = useState("All");
  const [pgiHeatmap, setPgiHeatmap] = useState({ categories: [], data: [] });
  const [parakhGradeWise, setParakhGradeWise] = useState([]);
  const [satGradeSem1, setSatGradeSem1] = useState({ grades: [], data: [] });
  const [satGradeSem2, setSatGradeSem2] = useState({ grades: [], data: [] });

  useEffect(() => {
    async function fetchData() {
      const [workbook, sem1Workbook] = await Promise.all([loadExcel(), loadSATSem1Excel()]);
      setRanking(getCombinedRankingWithSAT(workbook, sem1Workbook));
      setActionItems(getComparisonActionItems(workbook, sem1Workbook));
      setAllDistrictNames(getAllDistrictNames(workbook));
      setAllDistrictItems(getAllDistrictComparisonActionItems(workbook, sem1Workbook));
      setPgiHeatmap(getPGICategoryHeatmap(workbook));
      setParakhGradeWise(getSheetData(workbook, "Dashboard_PARAKH"));
      setSatGradeSem1(getSATSem1GradeWise(sem1Workbook));
      setSatGradeSem2(getSATGradeWise(workbook));
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

  const districts = ["All", ...new Set(ranking.districts.map((d) => d.District))];

  // Band distribution stays state-wide (33 districts) since a single
  // district's band is already shown in the table/chart below; only the
  // scatter chart and ranking table narrow to the selected district.
  const filteredDistricts =
    district === "All"
      ? ranking.districts
      : ranking.districts.filter((d) => d.District === district);

  return (
    <DashboardLayout>
      <Header />

      <DistrictCompareView
        districts={ranking.districts}
        defaultDistrictA={ranking.districts[0]?.District || ""}
        pgiHeatmap={pgiHeatmap}
        parakhGradeWise={parakhGradeWise}
        satGradeSem1={satGradeSem1}
        satGradeSem2={satGradeSem2}
      />

      <DistrictFilterBar district={district} setDistrict={setDistrict} districts={districts} />

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
        syncDistrict={district}
      />
    </DashboardLayout>
  );
};

export default Comparison;
