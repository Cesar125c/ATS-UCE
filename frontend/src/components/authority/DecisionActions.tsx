import { CheckCircle2, XCircle } from "lucide-react";
import Button from "../ui/Button";

interface DecisionActionsProps {
  onApprove: () => void;
  onReject: () => void;
  submitting?: boolean;
  result?: "success" | "error" | null;
}

export default function DecisionActions({
  onApprove,
  onReject,
  submitting,
  result,
}: DecisionActionsProps) {
  return (
    <div className="space-y-4">
      {result === "success" && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
          Decision registered successfully.
        </div>
      )}

      {result === "error" && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          Error registering the decision. Please try again.
        </div>
      )}

      <Button
        className="w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
        onClick={onApprove}
        disabled={submitting}
      >
        <CheckCircle2 size={18} />
        Approve Selection
      </Button>

      <Button
        className="w-full bg-white border border-red-300 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
        onClick={onReject}
        disabled={submitting}
      >
        <XCircle size={18} />
        Reject Candidate
      </Button>
    </div>
  );
}
