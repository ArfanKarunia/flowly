import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/shared/ClientLayout";
import { Wallet } from "lucide-react";

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
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {/* Panggil komponen UI yang sudah dipisah tadi ke sini */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}