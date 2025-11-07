import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

// Sử dụng font sans-serif cơ bản
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Practice Typing App",
  description: "A minimal 10-finger typing practice app.",
  icons: "/icon2.ico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex min-h-screen w-screen flex-col items-center justify-center bg-red-400">
          {children}
        </main>
      </body>
    </html>
  );
}
