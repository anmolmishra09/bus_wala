import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PlayerProvider } from '@/context/PlayerContext';
import YouTubeAPILoader from '@/components/bus/YouTubeAPILoader';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'बस वाला — All Night on NH 39',
  description: 'A nostalgic 90s Hindi music journey from Delhi to Jalpaiguri, WB, all night on NH 39. 227 tracks of pure nostalgia.',
  keywords: ['90s Hindi songs', 'nostalgic Hindi music', 'Bollywood', 'bus driver', 'NH 39', 'night journey', 'Jhanshi', 'Sonbhadra'],
  authors: [{ name: 'Bus Wala' }],
  metadataBase: new URL('https://buswala.com'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: 'बस वाला — All Night on NH 39',
    description: 'A nostalgic 90s Hindi music journey from Delhi to Jalpaiguri, WB, all night on NH 39.',
    url: 'https://buswala.in',
    siteName: 'Bus Wala',
    locale: 'hi_IN',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'बस वाला — NH 39 Night Express',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'बस वाला — All Night on NH 39',
    description: 'A nostalgic 90s Hindi music journey. Someone you know still knows every word.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#0c0502" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="bg-dusk text-white antialiased overflow-hidden">
        <YouTubeAPILoader />
        <PlayerProvider>
          {children}
        </PlayerProvider>
      </body>
    </html>
  );
}
