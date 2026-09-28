import "./globals.css";
import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";
import localFont from 'next/font/local'
import { ThemeProvider } from "@/providers/theme-provider";
import { LanguageProvider } from "@/providers/language-provider";
import BottomAppBar from "@/components/layout/nav/bottom-app-bar";
import Header from "@/components/layout/nav/header";
import Footer from "@/components/layout/nav/footer";
import { Toaster } from "@/components/ui/sonner";
import { YandexMetrika } from "@/components/layout/marketing/yandex-metrika";
import { CookieConsent } from "@/components/layout/marketing/cookie-consent";
import UserProvider from "@/entities/user/model/user-context";
import ClientRootLayout from "./client-layout";

export const Geist = localFont({
  src: '../public/fonts/Geist-VariableFont_wght.woff2',
  variable: '--font-sans',
});

const SITE_URL = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  // Absolute-URL anchor for every relative metadata path (canonical, og:image,
  // icons…). Without it, Next.js emits those URLs as root-relative and Yandex
  // resolves them against the wrong origin.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Цифровое агентство полного цикла Rovno.dev',
    template: '%s · Rovno.dev',
  },
  description:
    'Digital-агентство полного цикла Rovno.dev — дизайн, LLM, сайты, приложения, логотипы и айдентика, 3D.',
  applicationName: 'Rovno.dev',
  keywords: ['rovno.dev', 'digital-агентство', 'веб-разработка', 'дизайн', 'айдентика', '3D', 'LLM'],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Rovno.dev',
    title: 'Цифровое агентство полного цикла Rovno.dev',
    description: 'Дизайн, LLM, сайты, приложения, логотипы и айдентика, 3D.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(Geist.className, "font-sans")}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (theme === 'system' && supportDarkMode)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <UserProvider>
              <TooltipProvider>
                <ClientRootLayout>
                  {children}
                </ClientRootLayout>
                <CookieConsent />
              </TooltipProvider>
            </UserProvider>
          </LanguageProvider>
        </ThemeProvider>
        <YandexMetrika />
      </body>
    </html>
  );
}
