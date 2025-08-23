import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocifyByMe - GitHub Documentation Generator",
  description: "Generate beautiful documentation for your GitHub repositories using AI. Developed by Kushagra.",
  authors: [{ name: "Kushagra" }],
  creator: "Kushagra",
  keywords: ["GitHub", "Documentation", "AI", "Generator", "Kushagra", "DocifyByMe"],
  manifest: "/manifest.json",
  robots: "index, follow",
  openGraph: {
    title: "DocifyByMe - AI-Powered Documentation Generator",
    description: "Generate beautiful documentation for your GitHub repositories using advanced AI models.",
    type: "website",
    url: "https://docifybyme.netlify.app",
    siteName: "DocifyByMe",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocifyByMe - AI-Powered Documentation Generator",
    description: "Generate beautiful documentation for your GitHub repositories using advanced AI models.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
