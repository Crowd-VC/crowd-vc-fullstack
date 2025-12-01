import Link from 'next/link';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';
import routes from '@/config/routes';
import AccessPlatformButton from '../ui/access-platform-button';
import { Button } from '../ui/shadcn/button';
import { statistics } from '@/data/landing-data';

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden py-16 lg:py-24">
      {/* <BackgroundRippleEffect rows={20} cols={60} cellSize={48} /> */}

      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage: `
                linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)
              `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Radial gradient overlay */}
      <div className="pointer-events-none absolute opacity-60 inset-0 z-[5] [background:radial-gradient(circle_at_center,transparent_0%,transparent_20%,hsl(var(--background)/0.6)_50%,hsl(var(--background))_80%)]" />

      {/* Subtle glow orbs */}
      <div className="absolute right-[10%] top-[5%] z-[3] h-[300px] w-[300px] animate-float rounded-full bg-orange-500/8 blur-[120px] lg:h-[500px] lg:w-[500px]" />
      <div className="absolute bottom-[10%] left-[5%] z-[3] h-[350px] w-[350px] animate-float rounded-full bg-purple-500/6 blur-[120px] animation-delay-200 lg:h-[600px] lg:w-[600px]" />
      <div className="absolute left-[45%] top-[40%] z-[3] h-[250px] w-[250px] animate-float rounded-full bg-cyan-500/6 blur-[120px] animation-delay-500 lg:h-[450px] lg:w-[450px]" />

      <div className="container relative z-10 mx-auto px-6 lg:px-10">
        <div className="mx-auto max-w-[1100px] text-center">
          {/* Halal Badge */}
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-green-500/30 bg-green-500/5 px-4 py-2 backdrop-blur-sm">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-400">
              ✓
            </div>
            <span className="text-sm font-medium tracking-tight text-green-400/90">
              Shariah-Compliant • Secured by Base & Arbitrum
            </span>
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-5xl font-black leading-[1.05] tracking-[-0.04em] text-foreground lg:text-[72px]">
            Invest in
            <br />
            <span className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Tomorrow's Unicorns
            </span>
          </h1>

          {/* Subtitle */}
          <div className="mx-auto mb-12 max-w-[750px] space-y-2">
            <p className="text-lg leading-relaxed tracking-tight text-muted-foreground lg:text-xl">
              <span className="font-semibold text-slate-300">AI-powered</span>{' '}
              startup scoring • DAO governance • Start with just $100
            </p>
            <p className="text-lg leading-relaxed tracking-tight text-muted-foreground lg:text-xl">
              Vote with your voice. Earn with conviction. Build the future of
              venture capital.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={routes.pitches}>
              <AccessPlatformButton>Browse Startups →</AccessPlatformButton>
            </Link>
            <Button type="button" variant="outline" size="lg" asChild>
              <Link href={routes.submitPitch}>
                Submit Your Pitch
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {statistics.map((stat, index) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/20 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-border/60 hover:bg-card/30 hover:shadow-lg"
              >
                <div className="absolute left-0 top-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-slate-400 to-transparent transition-all duration-300 group-hover:w-full" />
                <div
                  className={`mb-2 text-4xl font-black lg:text-5xl ${index === 0
                    ? 'text-slate-300'
                    : index === 1
                      ? 'text-slate-200'
                      : 'text-slate-300'
                    }`}
                >
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
