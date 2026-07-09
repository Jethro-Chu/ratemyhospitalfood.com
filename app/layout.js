import "./globals.css";

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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
