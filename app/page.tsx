import HowItWorksSection from '@/app/components/landing/HowItWorksSection';
import FeaturesSection from './components/landing/FeaturesSection';
import HeroSection from "./components/landing/HeroSection";
import IntegrationsSection from './components/landing/IntegrationsSection';

export default function Home() {
  return (
    <div className = "min-h-screen bg-black">
      <HeroSection />
      <FeaturesSection/>
      <IntegrationsSection />
      <HowItWorksSection />
    </div>
  );
}
