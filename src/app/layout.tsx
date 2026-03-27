import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blazzer - Platform Video Dewasa Premium",
  description: "Blazzer adalah platform streaming video dewasa premium dengan koleksi terlengkap. Nikmati video berkualitas tinggi dengan pengalaman menonton terbaik untuk penikmat konten 18+.",
  keywords: ["streaming", "video dewasa", "18+", "adult", "entertainment", "premium"],
  authors: [{ name: "Blazzer Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Blazzer - Platform Video Dewasa Premium",
    description: "Platform streaming video dewasa premium dengan koleksi terlengkap untuk penikmat konten 18+",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
