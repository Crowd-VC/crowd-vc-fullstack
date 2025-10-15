'use client';

import React from 'react';
import { inter } from '@/app/fonts';
import { Navigation } from '@/components/landing/navigation';
import { HeroSection } from '@/components/landing/hero-section';
import { StatsSection } from '@/components/landing/stats-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { ProcessSection } from '@/components/landing/process-section';
import { TechnologySection } from '@/components/landing/technology-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className={`min-h-screen bg-black text-foreground ${inter.variable}`}>
      <div className="font-inter">
        <Navigation />
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <ProcessSection />
        <TechnologySection />
        <TestimonialsSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
