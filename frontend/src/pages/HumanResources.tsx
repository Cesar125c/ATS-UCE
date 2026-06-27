import MainLayout from "../components/layout/MainLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import Filters from "../components/dashboard/Filters";
import CandidateTable from "../components/dashboard/CandidateTable";
import Pagination from "../components/dashboard/Pagination";

export default function HumanResources() {
  return (
    <MainLayout>

      <DashboardHeader />

      <Filters />

      <CandidateTable />

      <Pagination />

    </MainLayout>
  );
}