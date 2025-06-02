import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ReduxProvider from "@/redux/ReduxProvider";
import CartSyncProvider from "@/components/CartSyncProvider";
import WhatsAppButton from "@/components/WhatsAppButton";
import Header from "@/components/Header";

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: '--font-montserrat',
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "Organic Funda | Premium Mushroom Store",
  description: "Discover premium organic mushrooms - sustainably grown, rich in flavor, and delivered fresh to your door.",
  keywords: "organic mushrooms, premium mushrooms, oyster mushrooms, shiitake, medicinal mushrooms, fresh mushrooms",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${playfair.variable} ${poppins.variable} font-sans bg-neutral-50`}>
        <ReduxProvider>
          <AuthProvider>
            <CartSyncProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">{children}</main>
                <WhatsAppButton />
              </div>
            </CartSyncProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
