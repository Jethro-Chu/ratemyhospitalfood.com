import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: 'Rate My Hospital Food',
  description: 'Read reviews, check ratings, and avoid the mystery meat at hospitals near you.',
  openGraph: {
    title: 'Rate My Hospital Food',
    description: 'Read reviews, check ratings, and avoid the mystery meat.',
    url: 'https://ratemyhospitalfood.com',
    siteName: 'Rate My Hospital Food',
    locale: 'en_US',
    type: 'website',
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
