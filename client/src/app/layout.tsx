import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import PageLayout from "@/components/PageLayout";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

const rubik = Rubik({
  subsets: ["latin", "cyrillic-ext"],
  variable: "--font-rubik",
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Memorium",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${rubik.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <PageLayout>
            {children}
          </PageLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
