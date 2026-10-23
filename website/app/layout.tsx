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
  src: './fonts/Geist-VariableFont_wght.woff2',
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
    'Digital-агентство полного цикла Rovno.dev - дизайн, LLM, сайты, приложения, логотипы и айдентика, 3D.',
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
    images: ['/api/og?title=Rovno.dev&subtitle=Digital%20Agency'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Цифровое агентство полного цикла Rovno.dev',
    description: 'Дизайн, LLM, сайты, приложения, логотипы и айдентика, 3D.',
    images: ['/api/og?title=Rovno.dev&subtitle=Digital%20Agency'],
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
        {/*
          Idempotent customElements.define().

          Lit (which model-viewer uses) calls customElements.define for
          both <model-viewer> and <extra-model> on module load, and Lit
          does NOT guard against re-registration. In dev, Turbopack HMR
          and React StrictMode re-execute the module that triggers the
          registration, so the second pass throws:

            Failed to execute 'define' on 'CustomElementRegistry':
            the name "extra-model" has already been used with this registry.

          This guard turns the duplicate into a silent no-op. It runs as
          a synchronous <head> script, so it is installed before any
          module script (including next/script afterInteractive) fires -
          the very first define call is already protected.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                if (!window.CustomElementRegistry) return;
                var proto = CustomElementRegistry.prototype;
                var orig = proto.define;
                proto.define = function(name, ctor, options) {
                  if (this.get(name)) return;
                  return orig.call(this, name, ctor, options);
                };
              })();
            `,
          }}
        />
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
