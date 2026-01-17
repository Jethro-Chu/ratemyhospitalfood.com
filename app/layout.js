import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Rate My Hospital Food",
  description: "Rate and review hospital Food.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
