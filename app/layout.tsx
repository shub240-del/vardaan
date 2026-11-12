import type { Metadata, Viewport } from "next";
import "./globals.css";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "Vardaan · Cashless claims, cleared without the cuts",
    template: "%s · Vardaan",
  },
  description:
    "Vardaan checks every cashless insurance claim file before it reaches the insurer, drafts query replies, and tracks every rupee deducted, for India's private hospitals and nursing homes.",
  keywords: ["cashless claims", "TPA", "hospital insurance claims", "claim deductions", "pre-auth", "nursing home", "India"],
  openGraph: {
    title: "Vardaan · You run a hospital. Not a TPA desk.",
    description: "Fewer queries, faster discharges, and every deducted rupee tracked. Get a free deduction audit.",
    url: site,
    siteName: "Vardaan",
    locale: "en_IN",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Vardaan", description: "Cashless claims, cleared without the cuts." },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F5EE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Vardaan",
    url: site,
    description: "Cashless insurance claims support for India's private hospitals.",
  };
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" />
      </head>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
