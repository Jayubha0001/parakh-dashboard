import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import Loading from "../components/Loading";
import CombinedBandSummary from "../components/CombinedBandSummary";
import CombinedRankingTable from "../components/CombinedRankingTable";
import DistrictRankingChart from "../charts/DistrictRankingChart";
import DistrictFilterBar from "../components/DistrictFilterBar";

import { loadExcel, getCombinedRanking } from "../services/dataService";

const Comparison = () => {
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState({ weights: {}, districts: [], bandSummary: [] });
  const [district, setDistrict] = useState("All");

  useEffect(() => {
    async function fetchData() {
      const workbook = await loadExcel();
      setRanking(getCombinedRanking(workbook));
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Header />
        <Loading message="Loading combined PGI-D + PARAKH ranking..." />
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

      <DistrictFilterBar district={district} setDistrict={setDistrict} districts={districts} />

      <CombinedBandSummary
        bandSummary={ranking.bandSummary}
        weights={ranking.weights}
      />

      <Box mt={4}>
        <DistrictRankingChart data={filteredDistricts} />
      </Box>

      <CombinedRankingTable data={filteredDistricts} />
    </DashboardLayout>
  );
};

export default Comparison;
