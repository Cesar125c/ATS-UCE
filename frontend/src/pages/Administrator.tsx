import MainLayout from "../components/layout/MainLayout";

import AdministrationHeader from "../components/administration/AdministrationHeader";
import AdminTabs from "../components/administration/AdminTabs";
import VacancyFilters from "../components/administration/VacancyFilters";
import VacancyTable from "../components/administration/VacancyTable";
import NewVacancyModal from "../components/administration/NewVacancyModal";
import type { VacancyForm } from "../components/administration/NewVacancyModal";
import { useState } from "react";

export default function Administration() {
  const [openModal, setOpenModal] = useState(false);
  return (
    <MainLayout>
      <AdministrationHeader />

      <AdminTabs />

      <VacancyFilters onNew={() => setOpenModal(true)} />

      <VacancyTable />

      <NewVacancyModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={(vacancy: VacancyForm) => console.log(vacancy)}
      />
    </MainLayout>
  );
}