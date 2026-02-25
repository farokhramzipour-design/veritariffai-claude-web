"use client";

import Link from 'next/link';

const StatCard = ({ title, value, subtitle }: { title: string, value: string, subtitle: string }) => (
  <div className="bg-bg-surface p-6 rounded-lg border border-border-default">
    <p className="text-sm text-text-secondary">{title}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
    <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
  </div>
);

const RecentCalculationItem = () => (
  <div className="bg-bg-surface p-4 rounded-lg border border-border-default flex flex-col sm:flex-row justify-between items-start sm:items-center">
    <div>
      <p className="font-bold">🇨🇳→🇬🇧 3 lines</p>
      <p className="text-sm text-text-secondary mt-1">8471300000 · 8517120000 · 9503001000</p>
      <p className="text-sm font-mono mt-2">Landed Cost: £47,284 | Duty: £4,812 | VAT: £9,419</p>
    </div>
    <div className="flex gap-2 mt-4 sm:mt-0">
      <button className="px-4 py-2 text-sm font-semibold rounded-md bg-bg-input">View</button>
      <button className="px-4 py-2 text-sm font-semibold rounded-md bg-bg-input">Duplicate</button>
    </div>
  </div>
);

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-display">Welcome back, Jane</h1>
        <div className="flex items-center gap-4">
          <Link 
            href="/calculator"
            className="px-4 py-2 font-semibold rounded-md bg-brand-primary text-bg-base"
          >
            + New Calculation
          </Link>
          <span className="text-sm font-semibold">Plan: PRO</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Calculated" value="£2.3M" subtitle="across 143 calcs" />
        <StatCard title="Avg Confidence" value="91%" subtitle="across all runs" />
        <StatCard title="This Month" value="47 calcs" subtitle="↑ 12 vs last mo" />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Recent Calculations</h2>
        <div className="space-y-4">
          <RecentCalculationItem />
          <RecentCalculationItem />
          <RecentCalculationItem />
        </div>
      </div>
    </div>
  );
}
