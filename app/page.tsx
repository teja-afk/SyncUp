import CTASection from '@/app/components/landing/CTASection';
import HowItWorksSection from '@/app/components/landing/HowItWorksSection';
import MoreFeaturesSection from '@/app/components/landing/MoreFeaturesSection';
import StatsSection from '@/app/components/landing/StatsSection';
import FeaturesSection from './components/landing/FeaturesSection';
import HeroSection from "./components/landing/HeroSection";
import IntegrationsSection from './components/landing/IntegrationsSection';
import Footer from '@/app/components/landing/Footer';

export default function Home() {
  return (
    <div className = "min-h-screen bg-black">
      <HeroSection />
      <FeaturesSection/>
      <IntegrationsSection />
      <HowItWorksSection />
      <StatsSection />
      <MoreFeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
