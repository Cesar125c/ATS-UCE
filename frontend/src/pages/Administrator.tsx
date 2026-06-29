import DashboardLayout from "../components/layout/DashboardLayout";

import AdministrationHeader from "../components/administration/AdministrationHeader";
import VacancyFilters from "../components/administration/VacancyFilters";
import VacancyTable from "../components/administration/VacancyTable";
import NewVacancyModal from "../components/administration/NewVacancyModal";
import { useState, useCallback } from "react";

export default function Administration() {
  const [openModal, setOpenModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <DashboardLayout>
      <AdministrationHeader />

      <VacancyFilters onNew={() => setOpenModal(true)} />

      <VacancyTable refreshKey={refreshKey} onRefresh={refresh} />

      <NewVacancyModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={refresh}
      />
    </DashboardLayout>
  );
}
