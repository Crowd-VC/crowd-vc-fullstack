import { statistics } from '@/data/landing-data';
import { landingStyles } from '@/lib/styles/landing-styles';

export function StatsSection() {
  return (
    <section aria-label="Platform statistics">
      <div className={landingStyles.grid.stats}>
        {statistics.map((stat) => (
          <article
            key={stat.value}
            className={`${landingStyles.card.base} ${landingStyles.card.padded}`}
            aria-label={`${stat.value} ${stat.label}`}
          >
            <div className="mb-2 text-5xl font-black tracking-[-0.03em] text-foreground">
              {stat.value}
            </div>
            <div className="text-[13px] font-medium text-muted-foreground">
              {stat.label}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
