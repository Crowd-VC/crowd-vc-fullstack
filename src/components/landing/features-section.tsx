import { WobbleCard } from '@/components/ui/wobble-card';
import { features } from '@/data/landing-data';

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
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <WobbleCard
              key={feature.title}
              containerClassName={`min-h-[300px] bg-gradient-to-br ${feature.gradient} border border-border`}
              className="flex flex-col justify-center"
            >
              <div className="relative z-10">
                <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card text-[26px]">
                  {feature.icon}
                </div>
                <h3 className="mb-3.5 text-xl font-bold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="text-[15px] font-normal leading-[1.65] tracking-tight text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </WobbleCard>
          ))}
        </div>
      </div>
    </section>
  );
}
