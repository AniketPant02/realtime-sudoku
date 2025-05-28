import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
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
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 1500,              // 1.5 seconds
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            },
            success: { iconTheme: { primary: '#06b6d4', secondary: '#fff' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
