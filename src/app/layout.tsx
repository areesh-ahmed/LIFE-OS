import type { Metadata } from "next";
import { Silkscreen, Space_Mono, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { SystemBar } from "@/components/layout/SystemBar";
import { StatusBar } from "@/components/layout/StatusBar";

const silkscreen = Silkscreen({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-silkscreen",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-atkinson",
});

export const metadata: Metadata = {
  title: "LIFE OS",
  description: "Personal Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${silkscreen.variable} ${spaceMono.variable} ${atkinson.variable} font-body antialiased flex flex-col h-screen overflow-hidden`}
      >
        <SystemBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
        <StatusBar />
      </body>
    </html>
  );
}
