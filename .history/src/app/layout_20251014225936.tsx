import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/NavBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TopNav />
        <div className="pt-14">{children}</div>
      </body>
    </html>
  );
}
