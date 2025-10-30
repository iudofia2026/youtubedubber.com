import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono, Roboto } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ToastNotifications";
import { AuthProvider } from "@/lib/auth-context";
import { Footer } from "@/components/Footer";
import { DevModeToggle } from "@/components/DevModeToggle";
import ConfigValidator from "@/components/ConfigValidator";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YT Dubber",
  description: "Transform your content with AI-powered multilingual dubbing",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${ibmPlexMono.variable} ${roboto.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              {/* Dev Mode Toggle - Only show in development */}
              {process.env.NODE_ENV === 'development' && <DevModeToggle />}
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
