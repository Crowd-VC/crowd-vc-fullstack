'use client';

import React, { useState } from 'react';
import { inter } from '@/app/fonts';
import { OpeningPortal } from '@/components/landing/opening-portal';
import { Navigation } from '@/components/landing/navigation';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { ProcessSection } from '@/components/landing/process-section';
import { PoolsSection } from '@/components/landing/pools-section';
import { TechnologySection } from '@/components/landing/technology-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { FAQSection } from '@/components/landing/faq-section';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  const [showPortal, setShowPortal] = useState(true);

  const handlePortalComplete = () => {
    setShowPortal(false);
  };

  return (
    <div className={`min-h-screen bg-black text-foreground ${inter.variable}`}>
      {showPortal && <OpeningPortal onComplete={handlePortalComplete} />}
      {
        !showPortal && (
          <div
            className={`font-inter transition-opacity duration-600 animate-fade-in-landing`}
          >
            <Navigation />
            <HeroSection />
            <FeaturesSection />
            <ProcessSection />
            <PoolsSection />
            <TechnologySection />
            <TestimonialsSection />
            <FAQSection />
            <CTASection />
            <Footer />
          </div>
        )}
    </div>
  );
}
