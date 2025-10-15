import { processSteps } from '@/data/landing-data';

export function ProcessSection() {
  return (
    <section id="process" className="py-28 lg:py-36">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="mx-auto mb-24 max-w-[900px] text-center">
          <h2 className="mb-6 text-5xl font-black leading-[1.1] tracking-[-0.04em] text-foreground lg:text-[64px]">
            Streamlined Investment Process
          </h2>
          <p className="text-lg font-normal leading-relaxed tracking-tight text-muted-foreground lg:text-[19px]">
            From capital deployment to equity distribution in four frictionless
            steps
          </p>
        </div>

        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="h-18 w-18 mx-auto mb-7 flex items-center justify-center rounded-full border border-border bg-gradient-to-br from-muted to-card text-[26px] font-black tracking-tight text-foreground">
                {step.number}
              </div>
              <h3 className="mb-3 text-lg font-bold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="text-sm font-normal leading-[1.65] tracking-tight text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
