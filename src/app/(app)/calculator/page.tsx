"use client";

import { useCalculatorStore } from "@/lib/stores/calculatorStore";
import dynamic from 'next/dynamic';
import CalculatorSidebar from "@/components/calculator/CalculatorSidebar";
import LivePreview from "@/components/calculator/LivePreview";

const StepSkeleton = () => <div className="w-full h-64 bg-bg-surface rounded-md animate-pulse"></div>;

const ShipmentSetup = dynamic(() => import('@/components/calculator/Step1_ShipmentSetup'), {
  loading: () => <StepSkeleton />,
  ssr: false,
});
const LineItems = dynamic(() => import('@/components/calculator/Step2_LineItems'), {
  loading: () => <StepSkeleton />,
  ssr: false,
});
const ReviewCalculate = dynamic(() => import('@/components/calculator/Step3_ReviewCalculate'), {
  loading: () => <StepSkeleton />,
  ssr: false,
});

const steps = ["Shipment", "Line Items", "Calculate"];

export default function CalculatorPage() {
  const currentStep = useCalculatorStore((state) => state.currentStep);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ShipmentSetup />;
      case 2:
        return <LineItems />;
      case 3:
        return <ReviewCalculate />;
      default:
        return <ShipmentSetup />;
    }
  };

  return (
    <div className="flex w-full h-full bg-bg-base">
      <CalculatorSidebar currentStep={currentStep} steps={steps} />
      <main className="flex-1 p-8 overflow-y-auto">
        {renderStep()}
      </main>
      <LivePreview />
    </div>
  );
}
