import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import Loading from "../components/Loading";
import SubjectPerformanceChart from "../charts/SubjectPerformanceChart";
import ComparisonSection from "../components/ComparisonSection";
import ContextualSummaryCards from "../components/ContextualSummaryCards";
import DistrictFilterBar from "../components/DistrictFilterBar";

import {
  loadExcel,
  getSubjectHeatmap,
  getGenderComparison,
  getLocationComparison,
  getManagementComparison,
  getSocialGroupComparison,
  getContextualSummary,
} from "../services/dataService";

const PARAKH = () => {
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState({ columns: [], data: [] });
  const [gender, setGender] = useState({ columns: [], data: [] });
  const [location, setLocation] = useState({ columns: [], data: [] });
  const [management, setManagement] = useState({ columns: [], data: [] });
  const [socialGroup, setSocialGroup] = useState({ columns: [], data: [] });
  const [contextual, setContextual] = useState({ columns: [], data: [] });
  const [district, setDistrict] = useState("All");

  useEffect(() => {
    async function fetchData() {
      const workbook = await loadExcel();

      setSubject(getSubjectHeatmap(workbook));
      setGender(getGenderComparison(workbook));
      setLocation(getLocationComparison(workbook));
      setManagement(getManagementComparison(workbook));
      setSocialGroup(getSocialGroupComparison(workbook));
      setContextual(getContextualSummary(workbook));

      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Header />
        <Loading message="Loading PARAKH breakdowns from Excel..." />
      </DashboardLayout>
    );
  }

  const districts = ["All", ...new Set(subject.data.map((d) => d.District))];

  // Every section below is one-row-per-district, so a single generic
  // filter narrows all of them consistently. Contextual Variables is
  // excluded — its rows are questionnaire types (School/Teacher/Pupil),
  // not districts, so a district filter doesn't apply to it.
  const byDistrict = (arr) =>
    district === "All" ? arr : arr.filter((d) => d.District === district);

  return (
    <DashboardLayout>
      <Header />

      <DistrictFilterBar district={district} setDistrict={setDistrict} districts={districts} />

      <SubjectPerformanceChart columns={subject.columns} data={byDistrict(subject.data)} />

      <ComparisonSection
        title="Boys vs Girls — Average Performance"
        icon="🚻"
        columns={gender.columns}
        data={byDistrict(gender.data)}
        color="#8E24AA"
      />

      <ComparisonSection
        title="Rural vs Urban — Average Performance"
        icon="🏘️"
        columns={location.columns}
        data={byDistrict(location.data)}
        color="#00897B"
      />

      <ComparisonSection
        title="School Management Type — Average Performance"
        icon="🏫"
        columns={management.columns}
        data={byDistrict(management.data)}
        color="#5D4037"
      />

      <ComparisonSection
        title="Social Group — Average Performance & Equity Gap"
        icon="🤝"
        columns={socialGroup.columns}
        data={byDistrict(socialGroup.data)}
        color="#C62828"
      />

      <ContextualSummaryCards data={contextual.data} />
    </DashboardLayout>
  );
};

export default PARAKH;
