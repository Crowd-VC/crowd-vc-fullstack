import Link from 'next/link';
import DottedGlowBackground from '@/components/ui/dotted-glow-background';
import routes from '@/config/routes';
import { footerLinks, socialLinks } from '@/data/landing-data';

export function Footer() {
  return (
    <footer className="relative border-t border-border py-20">
      <div />
      <div className="container relative z-10 mx-auto px-6 lg:px-10">
        <div className="mb-16 grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-20">
          <div className="lg:col-span-1">
            <div className="mb-5 flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-border bg-gradient-to-br from-muted to-card text-lg font-extrabold tracking-tight text-foreground">
                CV
              </div>
              <span className="text-[22px] font-extrabold tracking-tight text-foreground">
                CrowdVC
              </span>
            </div>
            <p className="text-sm leading-[1.7] tracking-tight text-muted-foreground">
              Institutional-grade decentralized venture capital platform powered
              by blockchain technology. Democratizing access to pre-seed and
              seed-stage investments globally.
            </p>
          </div>

          <div>
            <h3 className="mb-5 text-[13px] font-bold uppercase tracking-tight text-foreground">
              Platform
            </h3>
            <ul className="space-y-3.5">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href === '/pools' ? routes.pools : link.href}
                    className="text-sm font-medium tracking-tight text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-[13px] font-bold uppercase tracking-tight text-foreground">
              Resources
            </h3>
            <ul className="space-y-3.5">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium tracking-tight text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-[13px] font-bold uppercase tracking-tight text-foreground">
              Company
            </h3>
            <ul className="space-y-3.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium tracking-tight text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-border pt-8 sm:flex-row">
          <div className="text-[13px] tracking-tight text-muted-foreground">
            © 2025 CrowdVC. All rights reserved. Secured by Arbitrum.
          </div>
          <div className="flex gap-5">
            {socialLinks.map((social) => (
              <Link
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-base text-muted-foreground transition-all hover:border-border/80 hover:bg-card/80 hover:text-foreground"
                aria-label={social.label}
              >
                {social.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
