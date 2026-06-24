import type { Metadata } from "next";
import "./globals.css";
import RootHeader from "../components/RootHeader";
import RouteGuard from "../components/RouteGuard";
// import RouteGuard from "../components/RouteGuard";

export const metadata: Metadata = {
  title: "Car Rental System",
  description: "Modern Car Rental Marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-black text-white">
        <RootHeader />
        <RouteGuard>
          <main className="flex-1">{children}</main>
        </RouteGuard>
      </body>
    </html>
  );
}