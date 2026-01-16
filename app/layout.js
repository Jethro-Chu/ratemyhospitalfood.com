import "./globals.css";

export const metadata = {
  title: "Rate My Hospital Food",
  description: "Rate and review hospital Food.",
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
