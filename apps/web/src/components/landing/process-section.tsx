import { memo } from 'react';
import { processSteps, type ProcessStep } from '@/data/landing-data';
import { cn } from '@/lib/utils';

// Extract inline styles as constants to prevent recreation on each render
const GRID_BACKGROUND_STYLE = {
  backgroundImage:
    'linear-gradient(rgba(251, 146, 60, 0.15) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(251, 146, 60, 0.15) 1.5px, transparent 1.5px)',
  backgroundSize: '40px 40px',
} as const;

// Pre-compute className variations outside component to avoid recreation
const DESKTOP_CONTAINER_EVEN = 'relative mb-24 flex items-center gap-8 last:mb-0 flex-row';
const DESKTOP_CONTAINER_ODD = 'relative mb-24 flex items-center gap-8 last:mb-0 flex-row-reverse';
const CONTENT_WRAPPER_EVEN = 'w-[calc(50%-2rem)] text-right';
const CONTENT_WRAPPER_ODD = 'w-[calc(50%-2rem)] text-left';
const CARD_BASE = 'rounded-2xl border border-border bg-card/50 p-6 transition-[border-color,background-color,box-shadow] duration-300 hover:border-orange-500/50 hover:bg-card/70 hover:shadow-lg';
const CARD_EVEN = cn(CARD_BASE, 'ml-auto');
const CARD_ODD = cn(CARD_BASE, 'mr-auto');

// Memoized desktop timeline item component
const DesktopTimelineItem = memo(
  ({ step, index }: { step: ProcessStep; index: number }) => {
    const isEven = index % 2 === 0;

    // Memoize classNames to prevent recalculation
    const containerClassName = isEven ? DESKTOP_CONTAINER_EVEN : DESKTOP_CONTAINER_ODD;
    const wrapperClassName = isEven ? CONTENT_WRAPPER_EVEN : CONTENT_WRAPPER_ODD;
    const cardClassName = isEven ? CARD_EVEN : CARD_ODD;

    return (
      <div className={containerClassName}>
        {/* Content */}
        <div className={wrapperClassName}>
          <div className={cardClassName}>
            <h3 className="mb-3 text-xl font-bold tracking-tight text-foreground">
              {step.title}
            </h3>
            <p className="text-sm leading-[1.65] text-muted-foreground">
              {step.description}
            </p>
          </div>
        </div>

        {/* Marker */}
        <div className="absolute left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-orange-500 to-purple-500 text-2xl font-black text-white shadow-lg will-change-transform">
          {step.number}
        </div>

        {/* Spacer */}
        <div className="w-[calc(50%-2rem)]" />
      </div>
    );
  }
);

DesktopTimelineItem.displayName = 'DesktopTimelineItem';

// Memoized mobile timeline item component
const MobileTimelineItem = memo(
  ({ step, index, isLast }: { step: ProcessStep; index: number; isLast: boolean }) => (
    <div className="relative mb-12 flex gap-6 last:mb-0">
      {/* Vertical line (mobile) */}
      {!isLast && (
        <div className="absolute left-8 top-16 h-[calc(100%+3rem)] w-0.5 bg-gradient-to-b from-orange-500/50 to-purple-500/50 will-change-transform" />
      )}

      {/* Marker */}
      <div className="relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-orange-500 to-purple-500 text-2xl font-black text-white shadow-lg will-change-transform">
        {step.number}
      </div>

      {/* Content */}
      <div className="flex-1 pt-2">
        <h3 className="mb-3 text-lg font-bold tracking-tight text-foreground">
          {step.title}
        </h3>
        <p className="text-sm leading-[1.65] text-muted-foreground">
          {step.description}
        </p>
      </div>
    </div>
  )
);

MobileTimelineItem.displayName = 'MobileTimelineItem';

export const ProcessSection = memo(() => {
  return (
    <section id="process" className="relative overflow-hidden py-28 lg:py-36">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="h-full w-full bg-repeat" style={GRID_BACKGROUND_STYLE} />
      </div>

      <div className="container relative z-10 mx-auto px-6 lg:px-10">
        <div className="mx-auto mb-24 max-w-[900px] text-center">
          <h2 className="mb-6 text-5xl font-black leading-[1.1] tracking-[-0.04em] text-foreground lg:text-[64px]">
            How It Works
          </h2>
          <p className="text-lg font-normal leading-relaxed tracking-tight text-muted-foreground lg:text-[19px]">
            From wallet connection to equity distribution in four simple steps
          </p>
          <p className="mt-4 text-base font-semibold italic text-orange-400">
            🔗 One platform. Two economies. Infinite access.
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="relative mx-auto hidden max-w-[1000px] md:block">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-orange-500/50 via-purple-500/50 to-cyan-500/50 will-change-transform" />

          {processSteps.map((step, index) => (
            <DesktopTimelineItem key={step.number} step={step} index={index} />
          ))}
        </div>

        {/* Mobile/Tablet View */}
        <div className="mx-auto max-w-[600px] md:hidden">
          {processSteps.map((step, index) => (
            <MobileTimelineItem
              key={step.number}
              step={step}
              index={index}
              isLast={index === processSteps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

ProcessSection.displayName = 'ProcessSection';
