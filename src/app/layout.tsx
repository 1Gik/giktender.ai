import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GikTender AI",
  description: "Платформа для автоматизации подготовки тендерных документов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
