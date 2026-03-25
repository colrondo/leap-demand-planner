import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LEAP Demand Planning",
  description: "BMS LEAP Program Demand Planning Tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <footer className="text-center text-xs text-gray-400 py-3 border-t border-gray-200">
          learning@BMS | LEAP Demand Planning | Powered by Accenture
        </footer>
      </body>
    </html>
  );
}
