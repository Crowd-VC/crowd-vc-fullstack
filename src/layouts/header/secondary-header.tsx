'use client';

import * as React from 'react';
import Link from 'next/link';
import { industries } from './header-items';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import type { Pitch } from '@/lib/stores/pitches';
import { usePitchesStore } from '@/lib/stores/pitches';
// import { LogoIcon } from "@/assets/images/logo-icon";

export function SecondaryHeader() {
  const pitches = usePitchesStore((state) => state.pitches);

  const featuredIndustries = pitches
    .filter((pitch) => pitch.featured)
    .reduce(
      (acc, pitch) => {
        if (!acc[pitch.industry] && pitch.featured) {
          acc[pitch.industry] = pitch.featuredImage || '';
        }
        return acc;
      },
      {} as Record<string, string>,
    );
  return (
    <NavigationMenu className="">
      <NavigationMenuList>
        {industries.map((item) => (
          <NavigationMenuItem key={item.industry}>
            <NavigationMenuTrigger>{item.industry}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-4">
                  <NavigationMenuLink asChild>
                    <Link
                      className="relative flex h-full w-full select-none flex-col justify-end overflow-hidden rounded-md bg-gradient-to-b from-background to-accent p-6 no-underline outline-none focus:shadow-md"
                      href="/"
                    >
                      {featuredIndustries[item.industry] && (
                        <Image
                          src={featuredIndustries[item.industry]}
                          alt={item.industry}
                          fill
                          className="object-cover object-[50%_10%]"
                        />
                      )}
                      <div className="absolute inset-0 z-[5] bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      {/* <LogoIcon className="h-6 w-6" /> */}
                      <div className="relative z-10 mb-2 mt-4 text-lg font-medium">
                        {item.industry}
                      </div>
                      <p className="relative z-10 text-sm leading-tight text-muted-foreground">
                        {item.subcategories
                          .map((subcategory) => subcategory.category)
                          .join(', ')}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                {item.subcategories.map((subcategory) => (
                  <React.Fragment key={subcategory.category}>
                    <ListItem
                      key={subcategory.category}
                      href="/docs"
                      title={subcategory.category}
                    >
                      {subcategory.description}
                    </ListItem>
                  </React.Fragment>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
