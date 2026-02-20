import { Header } from "@/presentation/components/shared/layout/header";
import { Footer } from "@/presentation/components/shared/layout/footer";
import { SupabaseSettingsRepository } from "@/data/repositories/supabase-settings.repository";
import { createClient } from "@/lib/supabase/server";

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const settingsRepository = new SupabaseSettingsRepository(supabase);
    const settings = await settingsRepository.getPublicSettings();

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header settings={settings} />
            <main className="flex-1">
                {children}
            </main>
            <Footer settings={settings} />
        </div>
    );
}
