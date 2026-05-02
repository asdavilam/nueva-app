import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Burger Business Blueprint",
  description: "Cerebro administrativo para negocios de hamburguesas."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  );
}
