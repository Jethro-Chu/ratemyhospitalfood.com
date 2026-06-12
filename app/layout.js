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
  title: 'Rate My Hospital Food',
  description: 'Find and review hospital cafeteria food. Real reviews from real patients and staff.',
  openGraph: {
    title: 'Rate My Hospital Food',
    description: 'Find and review hospital cafeteria food.',
    url: 'https://ratemyhospitalfood.com',
    siteName: 'Rate My Hospital Food',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rate My Hospital Food',
    description: 'Find and review hospital cafeteria food.',
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
