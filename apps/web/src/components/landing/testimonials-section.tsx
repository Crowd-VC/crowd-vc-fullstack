import { testimonials } from '@/data/landing-data';

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden py-28 lg:py-36">
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
        <div className="mx-auto mb-16 max-w-[900px] text-center">
          <h2 className="mb-6 text-5xl font-black leading-[1.1] tracking-[-0.04em] text-foreground lg:text-[64px]">
            Trusted by Innovators
          </h2>
          <p className="text-lg font-normal leading-relaxed tracking-tight text-muted-foreground lg:text-[19px]">
            Early investors and founders who are shaping the future of venture
            capital
          </p>
        </div>

        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => {
            // Extract initials from name
            const initials = testimonial.name
              .split(' ')
              .map((n) => n[0])
              .join('');

            return (
              <div
                key={testimonial.name}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-orange-500/50 hover:bg-card/70 hover:shadow-lg"
              >
                {/* Star Rating */}
                <div className="mb-4 text-xl text-yellow-400">⭐⭐⭐⭐⭐</div>

                {/* Quote */}
                <p className="mb-6 text-sm leading-[1.65] text-muted-foreground">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  {/* Avatar with Initials */}
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-purple-500 text-sm font-bold text-white">
                    {initials}
                  </div>

                  {/* Author Info */}
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.title}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
