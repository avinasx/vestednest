import type { Metadata } from "next";
import { DM_Sans, Fraunces, Geist, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "./landing.css";
import "./product-pages.css";
import "./figma-ui.css";
import "./static-pages.css";
import "./flow.css";
import "./vestednest.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "500", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Vested Nest — The agentic DSCR lender",
  description:
    "Drop an address. Get a DSCR term sheet in 60 seconds. Realie property data, Nest AI, live rates. Close in 14 days.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} ${dmSans.variable} ${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden bg-vn-bg text-black">{children}</body>
    </html>
  );
}
