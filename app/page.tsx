import Image from "next/image";
import HeroSection from "./components/landing/HeroSection";

export default function Home() {
  return (
    <div className = "min-h-screen bg-black">
      <HeroSection />
    </div>
  );
}
