import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import PageLayout from "@/components/PageLayout";
import AuthGuard from "./authGuard";

const rubik = Rubik({
  subsets: ["latin", "cyrillic-ext"],
  variable: "--font-rubik",
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Memorium",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rubik.variable} antialiased`}
      >
        <AuthGuard>
          <PageLayout>
            {children}
          </PageLayout>
        </AuthGuard>
      </body>
    </html>
  );
}
