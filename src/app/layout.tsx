import type { Metadata } from "next";
import { Inter, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/presentation/components/shared/theme-provider";
import { VisitTracker } from '@/presentation/components/shared/analytics/VisitTracker'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "@/presentation/ui/sonner"
import { AreaProvider } from "@/contexts/area-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-kufi",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
});

import { SupabaseSettingsRepository } from "@/data/repositories/supabase-settings.repository";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const settingsRepository = new SupabaseSettingsRepository(supabase);
  // Default to empty object if fetch fails to prevent crash
  const settings = await settingsRepository.getPublicSettings().catch(() => ({} as Record<string, unknown>));

  return {
    title: (settings.site_name as string) || "دليل السويس | كل ما تحتاجه في مكان واحد",
    description: (settings.site_description as string) || "الدليل الشامل لمدينة السويس. اكتشف أفضل المطاعم، الكافيهات، الخدمات، والفعاليات في السويس.",
    verification: {
      google: "XLm7_2RXf6w84cJIoQ7xNNS-X-A6zVEgOOELIJCqchQ",
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'دليل السويس'
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: '/icons/apple-touch-icon.png',
      shortcut: '/favicon.svg'
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  };
}

export const viewport = {
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={cn(
        inter.variable,
        notoKufi.variable,
        "font-sans antialiased bg-background text-foreground"
      )} suppressHydrationWarning>
        <AreaProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <VisitTracker />
            {children}
            <SpeedInsights />
            <Toaster />
          </ThemeProvider>
        </AreaProvider>
      </body>
    </html>
  );
}
