import type { Metadata } from "next";
import { Syne, DM_Sans, Vazirmatn } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TokenHandler } from "@/components/TokenHandler";
import { Suspense } from "react";
import "../styles/globals.css";

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-body',
});

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-persian',
});

export const metadata: Metadata = {
  title: "TradeCalc — Customs Import Duty Calculator with Live TARIC Data",
  description: "Calculate your true import costs with customs-grade accuracy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${dmSans.variable} ${vazirmatn.variable} font-body`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <TokenHandler />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
