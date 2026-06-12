import "./globals.css";
import { Space_Grotesk, Syne, JetBrains_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "700"],
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
    <html lang="en" className={`${spaceGrotesk.variable} ${syne.variable} ${jetbrainsMono.variable}`}>
      <body className={spaceGrotesk.className}>
        {children}
      </body>
    </html>
  );
}
