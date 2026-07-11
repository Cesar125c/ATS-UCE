import Button from "../ui/Button";
import { Download } from "lucide-react";

export default function ApplicantHeader() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          Applicant Portal
        </h1>

        <p className="text-slate-500 mt-2">
          Upload your CV and track your application status in real time through
          our AI system.
        </p>

      </div>

      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => window.open("/guide.pdf", "_blank")}
      >
        <Download size={18} />

        Download Guide

      </Button>

    </div>
  );
}
