import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Study Planner',
  description: 'Manage your academic tasks and schedule effectively.',
  openGraph: {
    title: 'Smart Study Planner',
    description: 'Manage your academic tasks and schedule effectively.',
    siteName: 'Smart Study Planner',
  },
  icons: [
    {
      media: '(prefers-color-scheme=dark)',
      url: '/icon-dark.png',
      href: '/icon-dark.png',
    },
    {
      media: '(prefers-color-scheme=light)',
      url: '/icon-light.png',
      href: '/icon-light.png',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors toastOptions={{}} />
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
