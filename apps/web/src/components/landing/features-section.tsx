import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { features } from '@/data/landing-data';
import {
  Brain,
  FileCheck,
  PieChart,
  Vote,
  Globe,
  ShieldCheck
} from 'lucide-react';

const FeatureIcon = ({ type }: { type: string }) => {
  const iconMap: Record<string, React.JSX.Element> = {
    'ai-scoring': <Brain className="h-7 w-7 text-slate-400" />,
    'smart-contract': <FileCheck className="h-7 w-7 text-slate-400" />,
    'diversified': <PieChart className="h-7 w-7 text-slate-400" />,
    'transparent': <Vote className="h-7 w-7 text-slate-400" />,
    'global': <Globe className="h-7 w-7 text-slate-400" />,
    'security': <ShieldCheck className="h-7 w-7 text-slate-400" />,
  };

  return iconMap[type] || null;
};

export function FeaturesSection() {
  return (
    <section id="platform" className="py-28 lg:py-36">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="mx-auto mb-24 max-w-[900px] text-center">
          <h2 className="mb-6 text-5xl font-black leading-[1.1] tracking-[-0.04em] text-foreground lg:text-[64px]">
            Built for Institutional Scale
          </h2>
          <p className="text-lg font-normal leading-relaxed tracking-tight text-muted-foreground lg:text-[19px]">
            Enterprise-grade infrastructure meeting the rigorous demands of
            global investors and accelerators
          </p>
          <p className="mt-4 text-base font-medium italic text-slate-400">
            🔗 One platform. Two economies. Infinite access.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group min-h-[300px] border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border/80 hover:bg-card/50 hover:shadow-lg"
            >
              <CardContent className="flex h-full flex-col justify-center p-6">
                <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 group-hover:border-border/80">
                  <FeatureIcon type={feature.icon} />
                </div>
                <h3 className="mb-3.5 text-xl font-bold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="text-[15px] font-normal leading-[1.65] tracking-tight text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
