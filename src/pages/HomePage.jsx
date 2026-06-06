import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import ServicesGrid from "@/components/home/ServicesGrid";
import ServiceTransition from "@/components/home/ServiceTransition";
import MobileAppShowcase from "@/components/home/MobileAppShowcase";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import UnifiedCTA from "@/components/home/UnifiedCTA";
import useHomeStore from "@/store/useHomeStore";

const HomePage = () => {
  const content = useHomeStore((s) => s.content);
  const loading = useHomeStore((s) => s.loading);
  const fetchHome = useHomeStore((s) => s.fetchHome);

  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  if (loading && !content) {
    return (
      <div className="min-h-screen bg-hw-base flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-hw-primary animate-spin mb-4" />
        <p className="text-hw-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hw-base" data-testid="home-page">
      <HeroSection data={content} />
      <ServicesGrid data={content} />
      <ServiceTransition data={content} />
      <MobileAppShowcase data={content} />
      <WhyChooseUs data={content} />
      <UnifiedCTA data={content} />
    </div>
  );
};

export default HomePage;
