export default function PricingPreview() {
  return (
    <section className="py-24 text-center">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold font-display">Simple, honest pricing.</h2>
        <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="border border-border-default p-8 rounded-lg">
            <h3>Free</h3>
            <p className="text-4xl font-bold">£0</p>
            <button className="mt-4">Start Free →</button>
          </div>
          <div className="border border-brand-primary p-8 rounded-lg">
            <h3>Pro</h3>
            <p className="text-4xl font-bold">£49</p>
            <button className="mt-4">Get Pro Access →</button>
          </div>
        </div>
      </div>
    </section>
  );
}
