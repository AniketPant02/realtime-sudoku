import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OurSudoku",
  description: "A realtime sudoku game prepared by Aniket Pant. Built with Next.js, Supabase, and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={"antialiased"}
      >
        {children}
      </body>
    </html>
  );
}
