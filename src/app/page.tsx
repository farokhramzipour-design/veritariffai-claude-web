import { HeroSection } from '@/components/landing-v2/HeroSection';
import { ProblemSolution } from '@/components/landing-v2/ProblemSolution';
import { FeatureGrid } from '@/components/landing-v2/FeatureGrid';
import { Testimonials } from '@/components/landing-v2/Testimonials';
import { FinalCta } from '@/components/landing-v2/FinalCta';
import HeaderWrapper from '@/components/landing-v2/HeaderWrapper';
import { Footer } from '@/components/landing-v2/Footer';
import { GlobalEffects } from '@/components/landing-v2/GlobalEffects';

export default function LandingPageV2() {
  return (
    <div className="relative overflow-x-hidden min-h-screen">
      <GlobalEffects />
      <HeaderWrapper />
      <main className="relative z-10">
        <HeroSection />
        <ProblemSolution />
        <FeatureGrid />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
