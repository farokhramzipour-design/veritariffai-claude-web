import { HeroSection } from '@/components/landing-v2/HeroSection';
import { FeatureStrip } from '@/components/landing-v2/FeatureStrip';
import { ProblemSolution } from '@/components/landing-v2/ProblemSolution';
import { HowItWorks } from '@/components/landing-v2/HowItWorks';
import { Corridors } from '@/components/landing-v2/Corridors';
import { Pricing } from '@/components/landing-v2/Pricing';
import { FinalCta } from '@/components/landing-v2/FinalCta';
import HeaderWrapper from '@/components/landing-v2/HeaderWrapper';
import { Footer } from '@/components/landing-v2/Footer';
import { GlobalEffects } from '@/components/landing-v2/GlobalEffects';

export default function LandingPage() {
  return (
    <div className="relative overflow-x-hidden min-h-screen">
      <GlobalEffects />
      <HeaderWrapper />
      <main className="relative z-10">
        <HeroSection />
        <FeatureStrip />
        <ProblemSolution />
        <HowItWorks />
        <Corridors />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
