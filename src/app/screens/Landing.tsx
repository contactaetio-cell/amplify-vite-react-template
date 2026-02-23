import { Navigation } from "../components/Navigation";
import { HeroSection } from "../components/HeroSection";
import { ProblemSection } from "../components/ProblemSection";
import { PlatformSection } from "../components/PlatformSection";
import { UseCasesSection } from "../components/UseCasesSection";
import { FinalCTASection } from "../components/FinalCTASection";
import { Footer } from "../components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-aetio-blue-950">
      <Navigation />
      <main>
        <HeroSection />
        <ProblemSection />
        <PlatformSection />
        <UseCasesSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}