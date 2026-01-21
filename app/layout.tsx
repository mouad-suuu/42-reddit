import type React from "react";
import type { Metadata } from "next";
import { Space_Grotesk, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { NavHeaderClient } from "@/components/nav-header-client";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "42 Reddit- custom reddit for 42 students",
  description:
    "The custom reddit for 42 students. Share your 42 journey, find projects, and get help from peers.",
  generator: "42 Reddit",
  icons: {
    icon: [
      { url: "/Praxis_new1.png", type: "image/png", sizes: "any" },
      { url: "/Praxis_new1.png", type: "image/png", sizes: "32x32" },
      { url: "/Praxis_new1.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/Praxis_new1.png", type: "image/png", sizes: "180x180" }],
    shortcut: "/Praxis_new1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="manga" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('praxis-theme');
                  if (theme === 'cyberpunk' || theme === 'manga') {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${playfairDisplay.variable} font-sans antialiased text-foreground selection:bg-primary selection:text-primary-foreground`}
        style={{ height: "auto", minHeight: "100%" }}
      >
        <div className="min-h-screen flex flex-col relative overflow-x-hidden">
          <ThemeProvider>
            <AuthProvider>
              <NavHeaderClient />
              {children}
              <Analytics />
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
