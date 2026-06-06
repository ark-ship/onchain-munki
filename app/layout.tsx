import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ONCHAIN MUNKI",
  description: "Reject Humanity, return to munki.",
  icons: {
    icon: "/munki.png",
    shortcut: "/munki.png",
    apple: "/munki.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}