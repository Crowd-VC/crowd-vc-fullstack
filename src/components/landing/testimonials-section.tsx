import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { testimonials } from '@/data/landing-data';

export function TestimonialsSection() {
  return (
    <section className="py-28 lg:py-36">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="mx-auto mb-16 max-w-[900px] text-center">
          <h2 className="mb-6 text-5xl font-black leading-[1.1] tracking-[-0.04em] text-foreground lg:text-[64px]">
            Trusted by Investors Worldwide
          </h2>
          <p className="text-lg font-normal leading-relaxed tracking-tight text-muted-foreground lg:text-[19px]">
            Join thousands of investors who trust CrowdVC for their venture
            capital needs
          </p>
        </div>
        <InfiniteMovingCards
          items={testimonials}
          direction="left"
          speed="normal"
          pauseOnHover={true}
        />
      </div>
    </section>
  );
}
