import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Prescription Analyzer | Qualia Solutions",
  description: "AI-powered prescription analysis. Extract medicine information, dosage instructions, and JFDA verification.",
  keywords: ["pharmacy", "prescription", "AI", "medicine", "JFDA", "Jordan", "صيدلية"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${geist.variable} ${geistMono.variable} ${ibmPlexArabic.variable} antialiased`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-geist)',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
