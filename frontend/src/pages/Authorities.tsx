import { useState } from "react";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";


export default function Authorities() {
  return (
    <MainLayout>

    <AuthorityHeader />

    <div className="grid grid-cols-12 gap-6">

        <PendingCandidates />

        <div className="col-span-8">

            <CandidateProfile />

            <div className="grid grid-cols-3 gap-6">

                <AIAnalysisSummary />

                <ProcessHistory />

            </div>

            <DecisionForm />

        </div>

    </div>

</MainLayout>
}
