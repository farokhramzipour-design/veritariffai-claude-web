export default function Problem() {
  return (
    <section className="py-24">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm font-bold text-text-secondary">WHY IT MATTERS</p>
          <h2 className="mt-2 text-4xl font-bold font-display">Getting import costs wrong is expensive.</h2>
          <p className="mt-4 text-text-secondary">
            Traditional brokers are slow and expensive. Spreadsheet estimates miss crucial details. 
            Other "calculators" are too simple for real-world trade.
          </p>
        </div>
        <div>
          {/* Visual comparison will go here */}
          <p>Visual comparison card</p>
        </div>
      </div>
    </section>
  );
}
