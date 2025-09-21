import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navigation } from "@/components/navigation";
import { FloatingWallet } from "@/components/floating-wallet";
import { Footer } from "@/components/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Palette - Crowdfunding for Creators",
  description: "A modern patronage platform where creators raise funding for their projects and build direct relationships with supporters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <FloatingWallet />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
