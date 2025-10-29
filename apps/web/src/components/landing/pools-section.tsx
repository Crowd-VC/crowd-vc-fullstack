import { pools } from '@/data/landing-data';
import { Button } from '../ui/shadcn/button';

export function PoolsSection() {
  return (
    <section id="pools" className="relative overflow-hidden py-28 lg:py-36">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div
          className="h-full w-full animate-grid-move bg-repeat"
          style={{
            backgroundImage:
              'linear-gradient(rgba(251, 146, 60, 0.15) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(251, 146, 60, 0.15) 1.5px, transparent 1.5px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-6 lg:px-10">
        <div className="mx-auto mb-24 max-w-[900px] text-center">
          <h2 className="mb-6 text-5xl font-black leading-[1.1] tracking-[-0.04em] text-foreground lg:text-[64px]">
            Active Investment Pools
          </h2>
          <p className="text-lg font-normal leading-relaxed tracking-tight text-muted-foreground lg:text-[19px]">
            Curated opportunities with AI-scored startups. Join pools that match
            your investment thesis.
          </p>
          <p className="mt-4 text-base font-semibold italic text-orange-400">
            🚀 The World's First Hybrid Venture Capital Marketplace
          </p>
        </div>

        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => (
            <div
              key={pool.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-orange-500/50 hover:bg-card/70 hover:shadow-lg"
            >
              {/* Badge */}
              <div className="mb-4">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    pool.badge.variant === 'trending'
                      ? 'bg-orange-500/20 text-orange-400'
                      : pool.badge.variant === 'halal'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-purple-500/20 text-purple-400'
                  }`}
                >
                  {pool.badge.label}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="mb-3 text-xl font-bold tracking-tight text-foreground">
                {pool.title}
              </h3>
              <p className="mb-6 text-sm leading-[1.65] text-muted-foreground">
                {pool.description}
              </p>

              {/* Progress */}
              <div className="mb-6">
                <div className="mb-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${pool.progress.percentage}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  {pool.progress.current} / {pool.progress.target} (
                  {pool.progress.percentage}%)
                </p>
              </div>

              {/* Stats */}
              <div className="mb-6 grid grid-cols-3 gap-4 border-t border-border pt-4">
                <div className="text-center">
                  <div className="mb-1 text-lg font-bold text-foreground">
                    {pool.stats.minInvestment}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Min. Investment
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-lg font-bold text-foreground">
                    {pool.stats.investors}
                  </div>
                  <div className="text-xs text-muted-foreground">Investors</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-lg font-bold text-foreground">
                    {pool.stats.timeLeft}
                  </div>
                  <div className="text-xs text-muted-foreground">Time Left</div>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                className="w-full font-semibold text-white hover:bg-card/80 hover:text-white"
                size="lg"
                variant="outline"
              >
                Invest Now →
              </Button>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" className="font-semibold">
            View All 12 Active Pools →
          </Button>
        </div>
      </div>
    </section>
  );
}



