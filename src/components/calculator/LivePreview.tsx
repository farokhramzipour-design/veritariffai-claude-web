export default function LivePreview() {
  return (
    <aside className="w-80 p-8 border-l border-border-default bg-bg-surface">
      <h2 className="font-bold mb-4">📊 Live Estimate</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Goods Value (USD)</span>
          <span>$0.00</span>
        </div>
        <div className="flex justify-between">
          <span>Est. Customs Value</span>
          <span>£0.00</span>
        </div>
        <div className="flex justify-between">
          <span>Est. Duty</span>
          <span>£0.00 (0%)</span>
        </div>
        <div className="flex justify-between">
          <span>Est. VAT</span>
          <span>£0.00</span>
        </div>
        <hr className="border-border-default my-4" />
        <div className="flex justify-between font-bold">
          <span>Est. Landed Cost</span>
          <span>~£0.00</span>
        </div>
      </div>
      <p className="text-xs text-text-tertiary mt-4">
        ⚡ Powered by live tariff data
      </p>
    </aside>
  );
}
