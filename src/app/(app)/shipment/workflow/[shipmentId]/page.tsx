"use client";

import { useShipment } from "./components/ShipmentContext";
import { Step1_ClassificationSummary } from "./steps/Step1_Classification";
import { Step2_Duties } from "./steps/Step2_Duties";
import { Step3_Origin } from "./steps/Step3_Origin";
import { Step4_Supplier } from "./steps/Step4_Supplier";
import { Step5_Sanctions } from "./steps/Step5_Sanctions";
import { Step6_CDS } from "./steps/Step6_CDS";
import { Step7_Bundle } from "./steps/Step7_Bundle";

function StepContent() {
  const { currentStep } = useShipment();

  switch (currentStep) {
    case 1: return <Step1_ClassificationSummary />;
    case 2: return <Step2_Duties />;
    case 3: return <Step3_Origin />;
    case 4: return <Step4_Supplier />;
    case 5: return <Step5_Sanctions />;
    case 6: return <Step6_CDS />;
    case 7: return <Step7_Bundle />;
    default: return null;
  }
}

export default function WorkflowPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <StepContent />
    </div>
  );
}
