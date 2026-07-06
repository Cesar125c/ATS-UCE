import { useState } from "react";
import DecisionForm from "./DecisionForm";
import DecisionActions from "./DecisionActions";
import {
  submitEvaluation,
  validateEvaluation,
  type EvaluationRequest,
} from "@/services/evaluationService";

interface AuthorityDecisionPanelProps {
  applicationId?: string;
  onSuccess?: () => void;
}

export default function AuthorityDecisionPanel({
  applicationId,
  onSuccess,
}: AuthorityDecisionPanelProps) {
  const [observations, setObservations] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const handleDecision = async (decision: "APPROVED" | "REJECTED") => {
    setValidationError(null);
    setResult(null);

    const body: EvaluationRequest = { decision, observations };

    const error = validateEvaluation(body);
    if (error) {
      setValidationError(error);
      return;
    }

    setSubmitting(true);
    try {
      await submitEvaluation(applicationId ?? "", body);
      setResult("success");
      setObservations("");
      onSuccess?.();
    } catch {
      setResult("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <DecisionForm
          observations={observations}
          onObservationsChange={setObservations}
          validationError={validationError}
          disabled={submitting || result === "success"}
        />
      </div>

      <DecisionActions
        onApprove={() => handleDecision("APPROVED")}
        onReject={() => handleDecision("REJECTED")}
        submitting={submitting}
        result={result}
      />
    </div>
  );
}
