interface CalculatorSidebarProps {
  currentStep: number;
  steps: string[];
}

export default function CalculatorSidebar({ currentStep, steps }: CalculatorSidebarProps) {
  return (
    <aside className="w-60 p-8 border-r border-border-default">
      <h2 className="font-bold mb-8">Calculation Steps</h2>
      <nav>
        <ul>
          {steps.map((step, index) => (
            <li key={step} className="mb-4">
              <span className={`font-bold ${index + 1 === currentStep ? 'text-brand-primary' : ''}`}>
                {index + 1} ● {step}
              </span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
