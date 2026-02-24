import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/shared/ClientLayout";
import { Wallet } from "lucide-react";
import { ThemeProvider } from "./components/ThemeProvider";

export const viewport: Viewport = {
  themeColor: "#2563eb",
};
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Flowly - Track your flows, effortlessly.',
  description: 'A modern and effortless way to track your personal income and expenses.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png', 
    apple: '/apple-icon.png', 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900 transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}