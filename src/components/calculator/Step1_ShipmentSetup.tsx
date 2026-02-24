"use client";
import { useCalculatorStore } from "@/lib/stores/calculatorStore";
import { Step1Schema } from "@/lib/schemas/calculator";
import { useState } from "react";

export default function ShipmentSetup() {
  const { jurisdiction, originCountry, incoterm, setStep1, setCurrentStep } = useCalculatorStore();
  const [errors, setErrors] = useState<any>({});

  const handleNext = () => {
    const dataToValidate = {
      jurisdiction,
      origin_country: originCountry,
      destination_country: 'GB', // Assuming for now
      incoterm,
    };
    
    const result = Step1Schema.safeParse(dataToValidate);
    if (!result.success) {
      const formattedErrors = result.error.format();
      setErrors(formattedErrors);
    } else {
      setErrors({});
      setCurrentStep(2);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-display mb-8">Shipment Setup</h1>
      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block font-semibold mb-2">Jurisdiction</label>
          <div className="flex gap-2">
            <button onClick={() => setStep1({ jurisdiction: 'UK' })} className={`flex-1 p-3 rounded-md font-bold ${jurisdiction === 'UK' ? 'bg-brand-primary text-bg-base' : 'bg-bg-input'}`}>UK</button>
            <button onClick={() => setStep1({ jurisdiction: 'EU' })} className={`flex-1 p-3 rounded-md font-bold ${jurisdiction === 'EU' ? 'bg-brand-primary text-bg-base' : 'bg-bg-input'}`}>EU</button>
          </div>
        </div>

        <div>
          <label htmlFor="origin" className="block font-semibold mb-2">Origin Country</label>
          <input 
            type="text" 
            id="origin" 
            placeholder="e.g., CN"
            value={originCountry || ''}
            onChange={(e) => setStep1({ originCountry: e.target.value.toUpperCase() })}
            className="w-full p-3 rounded-md bg-bg-input border border-border-default" 
          />
          {errors.origin_country && <p className="text-sm text-text-error mt-1">{errors.origin_country._errors[0]}</p>}
        </div>

        <div>
          <label htmlFor="incoterm" className="block font-semibold mb-2">Incoterm</label>
          <select 
            id="incoterm" 
            value={incoterm || ''}
            onChange={(e) => useCalculatorStore.setState({ incoterm: e.target.value })}
            className="w-full p-3 rounded-md bg-bg-input border border-border-default"
          >
            <option value="">Select Incoterm...</option>
            <option value="FOB">FOB — Free On Board</option>
            <option value="CIF">CIF — Cost, Insurance, Freight</option>
            <option value="EXW">EXW — Ex Works</option>
            <option value="DDP">DDP — Delivered Duty Paid</option>
          </select>
          {errors.incoterm && <p className="text-sm text-text-error mt-1">{errors.incoterm._errors[0]}</p>}
        </div>

        <div className="pt-4">
          <button onClick={handleNext} className="w-full p-4 bg-brand-primary text-bg-base font-bold rounded-md">
            Continue: Add Line Items →
          </button>
        </div>
      </div>
    </div>
  );
}
