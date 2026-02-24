const LeftPanel = () => (
  <div className="w-full lg:w-1/2 bg-bg-surface p-12 flex flex-col justify-center items-center text-center">
    <h1 className="text-4xl font-bold font-display mb-4">
      Customs calculations that professionals trust.
    </h1>
    <ul className="text-text-secondary space-y-2">
      <li>• Live TARIC + UKGT data</li>
      <li>• 11 calculation engines</li>
      <li>• Full audit trail</li>
    </ul>
    {/* Mini calculation animation would go here */}
  </div>
);

const LoginCard = () => (
  <div className="w-full lg:w-1/2 p-12 flex items-center justify-center">
    <div className="w-full max-w-sm bg-bg-surface p-8 rounded-lg border border-border-default">
      <h2 className="text-2xl font-bold text-center mb-2">Welcome to TradeCalc</h2>
      <p className="text-text-secondary text-center mb-8">
        Sign in to save your calculations and unlock your full results.
      </p>
      <button className="w-full h-12 bg-white text-black font-semibold rounded-md flex items-center justify-center gap-2">
        <span>🇬</span>
        <span>Continue with Google</span>
      </button>
      <p className="text-xs text-text-tertiary text-center mt-4">
        By signing in you agree to our Terms of Service and Privacy Policy.
      </p>
      <div className="flex items-center my-6">
        <hr className="w-full border-border-default" />
        <span className="px-2 text-xs text-text-tertiary">OR</span>
        <hr className="w-full border-border-default" />
      </div>
      <a href="#" className="w-full text-center block text-sm text-text-secondary hover:text-text-primary">
        ← Back without signing in
      </a>
    </div>
  </div>
);

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <LeftPanel />
      <LoginCard />
    </div>
  );
}
