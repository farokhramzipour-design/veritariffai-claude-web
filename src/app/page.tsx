import { HeroSection } from '@/components/landing-v2/HeroSection';
import { LiveCalculatorPreview } from '@/components/landing-v2/LiveCalculatorPreview';
import { ProblemSolution } from '@/components/landing-v2/ProblemSolution';
import { FeatureGrid } from '@/components/landing-v2/FeatureGrid';
import { TransparencySection } from '@/components/landing-v2/TransparencySection';
import { Testimonials } from '@/components/landing-v2/Testimonials';
import { Pricing } from '@/components/landing-v2/Pricing';
import { FinalCta } from '@/components/landing-v2/FinalCta';
import HeaderWrapper from '@/components/landing-v2/HeaderWrapper';
import { Footer } from '@/components/landing-v2/Footer';

export default function LandingPageV2() {
  return (
    <div className="relative overflow-x-hidden">
      <HeaderWrapper />
      <main>
        <HeroSection />
        <LiveCalculatorPreview />
        <ProblemSolution />
        <FeatureGrid />
        <TransparencySection />
        <Testimonials />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
