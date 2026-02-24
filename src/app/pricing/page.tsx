const PlanCard = ({ name, price, description, features, isFeatured }: { name: string, price: string, description: string, features: string[], isFeatured?: boolean }) => (
  <div className={`p-8 rounded-lg border ${isFeatured ? 'border-brand-primary shadow-brand' : 'border-border-default'}`}>
    <h3 className="text-2xl font-bold">{name} {isFeatured && <span className="text-sm text-brand-primary">⭐ Most Popular</span>}</h3>
    <p className="text-4xl font-bold my-4">{price}</p>
    <p className="text-text-secondary mb-6">{description}</p>
    <ul className="space-y-2 text-sm">
      {features.map(feature => <li key={feature}>✓ {feature}</li>)}
    </ul>
    <button className={`w-full mt-8 py-3 font-bold rounded-md ${isFeatured ? 'bg-brand-primary text-bg-base' : 'bg-bg-input'}`}>
      {name === 'Free' ? 'Start Free' : 'Get Pro Access →'}
    </button>
  </div>
);

export default function PricingPage() {
  const freeFeatures = [
    "HS code validation",
    "Basic ad valorem duty",
    "Standard VAT (20% UK)",
    "10 calcs/hour",
  ];

  const proFeatures = [
    "Everything in Free, plus:",
    "Customs Valuation Engine",
    "Anti-dumping, Safeguards, Quotas",
    "Rules of Origin + Preferences",
    "PDF Export & Audit Trail",
    "Unlimited history",
    "Priority support",
  ];

  return (
    <div className="max-w-5xl mx-auto py-16 px-4 text-center">
      <h1 className="text-5xl font-extrabold font-display mb-4">Simple, honest pricing.</h1>
      <div className="flex justify-center items-center gap-4 my-8">
        <span>Monthly</span>
        <div className="w-12 h-6 bg-bg-input rounded-full p-1 flex items-center">
          <div className="w-4 h-4 bg-brand-primary rounded-full"></div>
        </div>
        <span>Annual <span className="text-brand-primary">(Save 20%)</span></span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <PlanCard 
          name="Free"
          price="£0"
          description="For quick single-line estimates."
          features={freeFeatures}
        />
        <PlanCard 
          name="Pro"
          price="£49/mo"
          description="For serious importers and brokers."
          features={proFeatures}
          isFeatured
        />
      </div>
    </div>
  );
}
