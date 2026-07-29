import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import PGIHeader from "../components/PGIHeader";
import PGIKPICards from "../components/PGIKPICards";
import PGIDomainCards from "../components/PGIDomainCards";
import PGITable from "../components/PGITable";
import PGIRankingChart from "../charts/PGIRankingChart";
import HeatMapChart from "../charts/HeatMapChart";
import Loading from "../components/Loading";
import DistrictFilterBar from "../components/DistrictFilterBar";
import ActionItemsQueue from "../components/ActionItemsQueue";

import {
  loadExcel,
  getStatePGISummary,
  getDistrictPGIRanking,
  getPGICategoryHeatmap,
  getPGIActionItems,
  getAllDistrictNames,
  getAllDistrictPGIActionItems,
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
      <Header />
      <PGIHeader overall={stateSummary.overall} />

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

      <HeatMapChart categories={heatmap.categories} data={filteredHeatmapData} />

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
