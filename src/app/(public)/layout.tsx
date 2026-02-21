import { Header } from "@/presentation/components/shared/layout/header";
import { Footer } from "@/presentation/components/shared/layout/footer";
import { DesktopSidebar } from "@/presentation/components/shared/layout/desktop-sidebar";
import { SupabaseSettingsRepository } from "@/data/repositories/supabase-settings.repository";
import { createClient } from "@/lib/supabase/server";
import { SmartAssistant } from "@/presentation/components/shared/smart-assistant";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const settingsRepository = new SupabaseSettingsRepository(supabase);
    const settings = await settingsRepository.getPublicSettings();

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header settings={settings} />
            <main className="flex-1 md:pr-[64px]">
                {children}
            </main>
            <DesktopSidebar />
            <div className="md:pr-[64px]">
                <Footer settings={settings} />
            </div>
            <SmartAssistant />
        </div>
    );
}
