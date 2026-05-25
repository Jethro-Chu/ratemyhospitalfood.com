import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  metadataBase: new URL('https://ratemyhospitalfood.com'),
  title: 'Rate My Hospital Food',
  description: 'Read reviews, check ratings, and avoid the mystery meat at hospitals near you.',
  openGraph: {
    title: 'Rate My Hospital Food',
    description: 'Read reviews, check ratings, and avoid the mystery meat at hospitals near you.',
    url: 'https://ratemyhospitalfood.com',
    siteName: 'Rate My Hospital Food',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rate My Hospital Food Preview Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rate My Hospital Food',
    description: 'Read reviews, check ratings, and avoid the mystery meat at hospitals near you.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
