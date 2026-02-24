export default function HowItWorks() {
  return (
    <section className="py-24 text-center">
      <div className="container mx-auto max-w-3xl">
        <p className="text-sm font-bold text-text-secondary">HOW IT WORKS</p>
        <h2 className="mt-2 text-4xl font-bold font-display">From invoice to landed cost in 3 steps.</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          <div>
            <h3>Step 1: Describe Your Shipment</h3>
            <p className="text-text-secondary">Enter your HS code, origin, value, and Incoterm.</p>
          </div>
          <div>
            <h3>Step 2: Engines Analyze Your Data</h3>
            <p className="text-text-secondary">Our 11 calculation engines run simultaneously.</p>
          </div>
          <div>
            <h3>Step 3: Get Your Full Cost Breakdown</h3>
            <p className="text-text-secondary">See every cost component with full transparency.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
