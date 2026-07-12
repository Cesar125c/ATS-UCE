import { Info } from "lucide-react";
import Card from "../ui/Card";

export default function UploadNotice() {
  return (
    <Card className="bg-[#eaf2fb] border border-[#aac5e2] shadow-none p-4 mb-6">

      <div className="flex gap-3 items-start">

        <Info size={17} className="text-[#124f91] mt-0.5 shrink-0" />

        <div>

          <p className="text-sm text-[#174f8d]">
            <span className="font-semibold">Required format:</span> PDF only, maximum size 10 MB. Your CV will be analyzed automatically by our AI system.
          </p>

        </div>

      </div>

    </Card>
  );
}
