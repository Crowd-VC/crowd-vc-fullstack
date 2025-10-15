import Link from 'next/link';
import routes from '@/config/routes';

export function CTASection() {
  return (
    <section id="about" className="lg:py-30 py-28">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="mx-auto max-w-[900px] text-center">
          <h2 className="mb-6 text-5xl font-black leading-[1.1] tracking-[-0.04em] text-foreground lg:text-[56px]">
            Join the Future of Venture Capital
          </h2>
          <p className="mb-12 text-lg font-normal leading-relaxed tracking-tight text-muted-foreground lg:text-[19px]">
            Access institutional-grade startup investments through decentralized
            infrastructure. Built for investors who demand transparency,
            security, and performance.
          </p>

          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={routes.signIn}>
              <button
                type="button"
                className="py-4.5 rounded-[10px] bg-foreground px-9 text-base font-bold tracking-tight text-background shadow-sm transition-all hover:-translate-y-0.5 hover:bg-foreground/90 hover:shadow-lg"
              >
                Access Platform
              </button>
            </Link>
            <button
              type="button"
              className="border-1.5 py-4.5 rounded-[10px] border-border bg-transparent px-9 text-base font-bold tracking-tight text-foreground transition-all hover:border-border/80 hover:bg-card/50"
            >
              Schedule Demo
            </button>
          </div>

          <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-12">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="text-muted-foreground">✓</span>
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="text-muted-foreground">✓</span>
              <span>Deploy capital in minutes</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="text-muted-foreground">✓</span>
              <span>Institutional custody available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
