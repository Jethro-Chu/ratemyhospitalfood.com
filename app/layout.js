import "./globals.css";
import { Inter, Fraunces } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "opsz"],
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
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
