import Link from 'next/link';
import AccessPlatformButton from '@/components/ui/access-platform-button';
import routes from '@/config/routes';
import { navigationLinks } from '@/data/landing-data';
import { landingStyles } from '@/lib/styles/landing-styles';

export function Navigation() {
  return (
    <nav
      className="sticky top-0 z-[1000] border-b border-border/40 bg-black/95 backdrop-blur-xl"
      aria-label="Main navigation"
    >
      <div className={landingStyles.container}>
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3.5"
            aria-label="CrowdVC Home"
          >
            <div className={landingStyles.logo.container}>CV</div>
            <span className={landingStyles.logo.text}>CrowdVC</span>
          </Link>
          <div className="flex items-center gap-12">
            <ul className="hidden gap-10 lg:flex">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm font-medium tracking-tight text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <Link href={routes.signIn}>
              <AccessPlatformButton>Launch Platform</AccessPlatformButton>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
