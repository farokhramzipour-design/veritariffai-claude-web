import React from 'react';
import { ConfidenceMeter } from './results/ConfidenceMeter';
import { CostTable } from './results/CostTable';
import { WarningCards } from './results/WarningCards';
import { RoODetail } from './results/RoODetail';
import { ResultsActions } from './results/ResultsActions';

export const ResultsPanel = () => {
  // Dummy data for demonstration
  const dummyConfidenceFactors = [
    { factor: 'HS Code accuracy', contribution: 30, source: 'LIVE' as const },
    { factor: 'Duty rate', contribution: 25, source: 'LIVE' as const },
    { factor: 'Rules of Origin', contribution: 15, source: 'CHECKED' as const },
    { factor: 'VAT rate', contribution: 10, source: 'STATIC' as const },
    { factor: 'Anti-dumping', contribution: 8, source: 'LIVE' as const },
    { factor: 'FX rate', contribution: 5, source: 'LIVE 1h cache' as const },
  ];

  const dummyCostBreakdown = [
    { component: 'Declared Value', rate: '—', amount_gbp: 2000, amount_eur: 2340, amount_usd: 2600 },
    { component: 'Import Duty (MFN)', rate: '4.5%', amount_gbp: 90, amount_eur: 105.3, amount_usd: 117 },
    { component: 'Import VAT', rate: '20%', amount_gbp: 418, amount_eur: 489.06, amount_usd: 543.4 },
    { component: 'Freight (CIF add.)', rate: '—', amount_gbp: 0, amount_eur: 0, amount_usd: 0 },
    { component: 'Anti-Dumping', rate: '0%', amount_gbp: 0, amount_eur: 0, amount_usd: 0 },
  ];

  const dummyTotalLandedCost = { gbp: 2508, eur: 2934.36, usd: 3260.4 };

  const dummyWarnings = [
    {
      type: 'warning' as const,
      title: 'Rules of Origin — Preferential Rate NOT Applied',
      message: 'This product may not qualify for the UK-EU TCA 0% preferential duty rate. Standard MFN rate of 4.5% has been applied.',
      action: 'View RoO Details',
    },
    {
      type: 'info' as const,
      title: 'Destination VAT Rate Estimated',
      message: 'The VAT rate for the destination country is an estimate based on standard rates and may vary.',
    },
  ];

  const dummyRoO = {
    qualifies: 'uncertain' as const,
    confidence: 62,
    tca_rule: 'Manufacture from materials of any heading, except from headings 64.01 to 64.05',
    reasoning: 'Unable to confirm origin of materials used in manufacture. If materials are sourced from UK/EU, the product likely qualifies. Recommend verification.',
    recommended_actions: [
      'Obtain supplier declaration confirming UK/EU origin of uppers and soles',
      'Consider applying for a Binding Tariff Information (BTI)',
    ],
  };

  return (
    <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-8 relative">
      <h2 className="text-2xl font-bold mb-4 text-[var(--text)]">Calculation Results</h2>

      <ConfidenceMeter confidence={91} factors={dummyConfidenceFactors} />
      <CostTable breakdown={dummyCostBreakdown} total={dummyTotalLandedCost} />
      <WarningCards warnings={dummyWarnings} />
      <RoODetail roo={dummyRoO} />
      <ResultsActions />
    </div>
  );
};
