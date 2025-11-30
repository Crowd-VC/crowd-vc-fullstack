import cn from '@/utils/cn';
import type { Metadata } from 'next';
import { fira_code, kaleko105, inter } from './fonts';
import { RootProvider } from '@/components/providers';
import { ThemeProvider } from '@/components/providers/theme-provider';

import { Toaster } from '@/components/ui/sonner';
// third party css files
import 'overlayscrollbars/overlayscrollbars.css';
import 'swiper/css';
import 'swiper/css/pagination';

// base css file
import '@/assets/css/range-slider.css';
import '@/assets/css/scrollbar.css';
import '@/assets/css/globals.css';

export const metadata: Metadata = {
  title: 'CrowdVC',
  description: 'CrowdVC - Decentralized Venture Capital Platform',
  icons: {
    icon: {
      url: '/favicon.ico',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={cn(
        'light',
        fira_code.className,
        kaleko105.variable,
        inter.variable,
      )}
      suppressHydrationWarning
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1 maximum-scale=1"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
