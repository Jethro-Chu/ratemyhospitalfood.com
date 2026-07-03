import "./globals.css";
import { DM_Sans, Bricolage_Grotesque, DM_Mono } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata = {
  metadataBase: new URL('https://ratemyhospitalfood.com'),
  title: {
    default: 'Rate My Hospital Food — Find out which hospitals actually have good food',
    template: '%s · Rate My Hospital Food',
  },
  description:
    'Search hospitals, read real food reviews from patients, visitors, and staff — and rate the trays yourself. Free, no sign-up.',
  openGraph: {
    title: 'Rate My Hospital Food',
    description: 'Find out which hospitals actually have good food. Real reviews, real cafeterias.',
    url: 'https://ratemyhospitalfood.com',
    siteName: 'Rate My Hospital Food',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rate My Hospital Food',
    description: 'Find out which hospitals actually have good food. Real reviews, real cafeterias.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${bricolage.variable} ${dmMono.variable}`}>
      <body className={dmSans.className}>
        {children}
      </body>
    </html>
  );
}
