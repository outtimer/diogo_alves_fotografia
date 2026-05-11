import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import PageTransition from "@/components/PageTransition";
import "./globals.css";
import { getSiteContent } from "./admin/actions";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["italic", "normal"],
});

export const metadata: Metadata = {
  title: "Aura Portfolio | Diogo Alves",
  description: "Capturando a essência do cotidiano em luz e cor.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();

  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <Sidebar content={content} />
        <main>
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </body>
    </html>
  );
}
