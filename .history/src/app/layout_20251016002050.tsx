import type { Metadata } from "next";
import "./globals.css";
import TopNavBar from "@/components/TopNavBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TopNavBar />
        <div>{children}</div>
      </body>
    </html>
  );
}
