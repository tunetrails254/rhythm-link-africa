import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { TeachersSection } from "@/components/TeachersSection";
import { GigsSection } from "@/components/GigsSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TeachersSection />
      <GigsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
