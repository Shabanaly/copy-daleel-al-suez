import { getContactMessagesAction } from "@/actions/notifications.actions";
import { ContactManager } from "./contact-manager";
import { MessageSquare } from "lucide-react";

export const metadata = {
    title: "رسائل التواصل — لوحة التحكم",
};

export default async function AdminContactPage() {
    const { success, messages, total } = await getContactMessagesAction();

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group transition-all">
                        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">رسائل التواصل</h1>
                        <p className="text-muted-foreground mt-1 text-sm font-medium">إدارة الردود والرسائل الواردة من نموذج الاتصال</p>
                    </div>
                </div>

                <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                    <span className="text-xs font-bold text-muted-foreground ml-2">الإجمالي:</span>
                    <span className="text-xl font-black text-primary">{total || 0}</span>
                </div>
            </div>

            <ContactManager
                initialMessages={(success ? messages : []) as any}
                total={total || 0}
            />
        </div>
    );
}
