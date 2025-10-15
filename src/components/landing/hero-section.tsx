import Link from 'next/link';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';
import { LayoutTextFlip } from '@/components/ui/layout-text-flip';
import routes from '@/config/routes';
import AccessPlatformButton from '../ui/access-platform-button';
import { Button } from '../ui/shadcn/button';

export function HeroSection() {
  return (
    <section className="relative h-screen overflow-hidden py-2 lg:py-36">
      <BackgroundRippleEffect rows={13} cols={30} cellSize={48} />
      {/* Radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 z-[5] [background:radial-gradient(circle_at_center,transparent_0%,transparent_20%,hsl(var(--background)/0.6)_50%,hsl(var(--background))_80%)]" />
      <div className="container relative z-10 mx-auto px-6 lg:px-10">
        <div className="mx-auto max-w-[1100px] text-center">
          <div className="px-4.5 mb-10 inline-flex items-center gap-2.5 rounded-full border border-border bg-gradient-to-tr from-slate-400 to-slate-100 px-3 py-2 backdrop-blur-sm">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-600" />
            <span className="text-[13px] font-medium tracking-tight text-gray-700">
              Institutional-Grade Decentralized VC Platform
            </span>
          </div>

          <h1 className="mb-8 flex flex-col items-center justify-center gap-4 text-6xl font-black leading-[1.05] tracking-[-0.04em] text-foreground lg:text-[80px]">
            <span>Venture Capital,</span>
            <LayoutTextFlip
              text=""
              words={[
                'Democratized',
                'Decentralized',
                'Transparent',
                'Accessible',
              ]}
              duration={3000}
            />
          </h1>

          <p className="mx-auto mb-14 max-w-[800px] text-lg font-normal leading-relaxed tracking-tight text-muted-foreground lg:text-[21px]">
            Blockchain-powered investment pools enabling global access to
            pre-vetted startups. Smart contracts. DAO governance. Institutional
            security.
          </p>

          <div className="mb-24 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={routes.signIn}>
              <AccessPlatformButton>Launch Platform</AccessPlatformButton>
            </Link>
            <Button type="button">Watch Demo</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
