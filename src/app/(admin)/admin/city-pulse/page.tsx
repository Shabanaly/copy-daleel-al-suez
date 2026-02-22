import { getAllCityPulseItems } from "@/actions/city-pulse.actions";
import { CityPulseManager } from "./city-pulse-manager";
import { Activity } from "lucide-react";

export const metadata = {
    title: "نبض السويس — لوحة التحكم",
};

export default async function CityPulsePage() {
    const items = await getAllCityPulseItems().catch(() => []);

    const activeCount = items.filter(i => i.isActive).length;
    const timedCount = items.filter(i => i.endsAt).length;

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-8" dir="rtl">
            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                    <Activity className="text-primary" size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">نبض السويس</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        إدارة الرسائل المتحركة في أعلى الصفحة الرئيسية — تحكّم فيما يراه الزوار في الوقت الفعلي.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold">{items.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">إجمالي الرسائل</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-500">{activeCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">مفعّلة الآن</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-orange-500">{timedCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">مؤقتة (بتاريخ انتهاء)</p>
                </div>
            </div>

            {/* How it works note */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">💡 كيف يشتغل؟</p>
                <ul className="list-disc list-inside space-y-1 pr-1">
                    <li>الرسائل بتتعرض بالترتيب حسب <strong>الأولوية</strong> (الأعلى أولاً)</li>
                    <li>الرسالة بـ<strong>تاريخ انتهاء</strong> بتختفي تلقائياً بعد الموعد بدون تدخل</li>
                    <li>رسائل <strong>الفعاليات</strong> بتضاف تلقائياً لما تنشئ فعالية جديدة</li>
                    <li>لو ما فيش رسائل مفعّلة، بيظهر نص ترحيبي افتراضي</li>
                </ul>
            </div>

            {/* Manager */}
            <CityPulseManager initialItems={items} />
        </div>
    );
}
