import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/NavBar";
import PageBackground from "@/components/PageBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PageBackground />
        <TopNav />
        <div className="pt-14">{children}</div>
      </body>
    </html>
  );
}
