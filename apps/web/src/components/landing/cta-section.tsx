import Link from 'next/link';
import routes from '@/config/routes';
import AccessPlatformButton from '../ui/access-platform-button';
import { Button } from '../ui/shadcn/button';

export function CTASection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden py-28 lg:py-36"
    >
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

      {/* Glow orbs */}
      <div className="absolute left-[10%] top-[20%] z-[3] h-[250px] w-[250px] animate-float rounded-full bg-orange-500/15 blur-[100px] lg:h-[400px] lg:w-[400px]" />
      <div className="absolute bottom-[20%] right-[10%] z-[3] h-[300px] w-[300px] animate-float rounded-full bg-purple-500/10 blur-[100px] animation-delay-200 lg:h-[500px] lg:w-[500px]" />

      <div className="container relative z-10 mx-auto px-6 lg:px-10">
        <div className="mx-auto max-w-[900px] text-center">
          <h2 className="mb-6 text-5xl font-black leading-[1.1] tracking-[-0.04em] text-foreground lg:text-[56px]">
            Ready to Back Tomorrow's Winners?
          </h2>
          <p className="mb-12 text-lg font-normal leading-relaxed tracking-tight text-muted-foreground lg:text-[19px]">
            Join 1,234 investors who've already deployed $2.4M across 47
            startups.
            <br />
            No setup fees. No hidden charges. Just transparent,
            blockchain-powered VC.
          </p>

          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={routes.signIn}>
              <AccessPlatformButton>Get Started Now →</AccessPlatformButton>
            </Link>
            <Button type="button" variant="outline" size="lg">
              Schedule a Demo
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-12">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="text-lg text-green-500">✓</span>
              <span>Deploy capital in minutes</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="text-lg text-green-500">✓</span>
              <span>AI-vetted startups only</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="text-lg text-green-500">✓</span>
              <span>Halal pools available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
