import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LocaleProvider } from "@/components/LocaleContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CatExplorer",
  description: "Explore and favorite cats from around the world",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <ThemeProvider>
          <LocaleProvider>
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-8">
              {children}
            </main>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}