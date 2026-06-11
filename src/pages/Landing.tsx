import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useStations } from '@/hooks/useStations';
import { LandingHero } from '@/components/landing/LandingHero';
import { CoverageSection } from '@/components/landing/CoverageSection';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LandingCTA } from '@/components/landing/LandingCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Landing() {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const { data: stations } = useStations();

  const activeStations = (stations ?? []).filter((s) => s.is_active);
  const cities = [...new Set(activeStations.map((s) => s.city).filter(Boolean))];

  const handleExplore = () => navigate('/home');

  return (
    <div className="min-h-screen bg-background flow-root">
      <LandingHero onExplore={handleExplore} onRegister={openAuthModal} />
      <CoverageSection
        stationCount={activeStations.length || undefined}
        cities={cities}
      />
      <div id="features" className="scroll-mt-24">
        <LandingFeatures />
      </div>
      <div id="how-it-works" className="scroll-mt-24">
        <HowItWorks />
      </div>
      <LandingCTA onExplore={handleExplore} onRegister={openAuthModal} />
      <LandingFooter onRegister={openAuthModal} />
    </div>
  );
}
