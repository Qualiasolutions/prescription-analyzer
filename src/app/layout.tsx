import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "صيدلي AI | Prescription Analyzer",
  description: "AI-powered prescription analysis tool for pharmacies. Extract medicine information, get dosage instructions, and check for drug interactions.",
  keywords: ["pharmacy", "prescription", "AI", "medicine", "SFDA", "drug interactions", "صيدلية"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="ltr">
      <body className={`${inter.variable} ${ibmPlexArabic.variable} antialiased`}>
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: 'var(--font-inter)',
            },
          }}
        />
      </body>
    </html>
  );
}
