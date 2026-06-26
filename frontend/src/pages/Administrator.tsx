import MainLayout from "../components/layout/MainLayout";

import AdministrationHeader from "../components/administration/AdministrationHeader";
import AdminTabs from "../components/administration/AdminTabs";
import VacancyFilters from "../components/administration/VacancyFilters";
import VacancyTable from "../components/administration/VacancyTable";

export default function Administration() {
  return (
    <MainLayout>

      <AdministrationHeader />

      <AdminTabs />

      <VacancyFilters />

      <VacancyTable />

    </MainLayout>
  );
}