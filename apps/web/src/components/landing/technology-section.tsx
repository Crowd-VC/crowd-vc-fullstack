import { techStack } from '@/data/landing-data';

export function TechnologySection() {
  return (
    <section id="technology" className="py-28 lg:py-36">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="mx-auto mb-24 max-w-[900px] text-center">
          <h2 className="mb-6 text-5xl font-black leading-[1.1] tracking-[-0.04em] text-foreground lg:text-[64px]">
            Battle-Tested Infrastructure
          </h2>
          <p className="text-lg font-normal leading-relaxed tracking-tight text-muted-foreground lg:text-[19px]">
            Enterprise blockchain architecture built on industry-leading
            protocols
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="rounded-2xl border border-border bg-card/50 px-6 py-9 text-center backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-border/80 hover:bg-card"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card text-[26px]">
                {tech.icon}
              </div>
              <div className="mb-1.5 text-[15px] font-bold tracking-tight text-foreground">
                {tech.name}
              </div>
              <div className="text-xs font-medium text-muted-foreground">
                {tech.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
