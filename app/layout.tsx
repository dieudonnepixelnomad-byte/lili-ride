import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-source-serif",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Lili-Ride — Mobilité au Cameroun",
  description: "Covoiturage entre particuliers, transport de colis et location de véhicules. Disponible à Douala, Yaoundé et Bafoussam.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} ${geistMono.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
