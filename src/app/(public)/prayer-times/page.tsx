import { getPrayerTimes } from "@/actions/prayer.actions";
import { Metadata } from "next";
import { PrayerTimesView } from "@/presentation/features/prayer-times/prayer-times-view";

export async function generateMetadata(): Promise<Metadata> {
    const year = new Date().getFullYear();
    return {
        title: `مواقيت الصلاة في السويس اليوم | مواعيد الصلاة الدقيقة ${year}`,
        description: `مواقيت الصلاة اليومية لمدينة السويس لعام ${year}. جدول دقيق لصلاة الفجر، الظهر، العصر، المغرب، والعشاء مع عداد تنازلي لحظي للصلاة القادمة.`,
        keywords: ["مواقيت الصلاة", "السويس", "موعد صلاة الفجر السويس", "وقت صلاة الظهر السويس", "مواعيد الصلاة اليوم", "دليل السويس"],
        openGraph: {
            title: `مواقيت الصلاة في السويس | دليل السويس ${year}`,
            description: `تعرف على مواعيد الصلاة الدقيقة في السويس لعام ${year} مع العداد التنازلي اللحظي.`,
            type: "website",
            locale: "ar_EG",
            url: "https://daleel-al-suez.com/prayer-times",
        },
        twitter: {
            card: "summary_large_image",
            title: `مواقيت الصلاة في السويس ${year}`,
            description: `مواعيد الصلاة الدقيقة والمحدثة يومياً في مدينة السويس لعام ${year}.`,
        },
        alternates: {
            canonical: "https://daleel-al-suez.com/prayer-times",
        }
    };
}

export const revalidate = 3600; // Revalidate every hour

export default async function PrayerTimesPage() {
    const prayerTimes = await getPrayerTimes();

    if (!prayerTimes) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <p className="text-muted-foreground">حدث خطأ في تحميل مواقيت الصلاة</p>
            </div>
        );
    }

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "مواقيت الصلاة في السويس",
        "description": "مواقيت الصلاة اليومية لمدينة السويس - الفجر، الظهر، العصر، المغرب، العشاء",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "الرئيسية",
                    "item": "https://daleel-al-suez.com/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "مواقيت الصلاة",
                    "item": "https://daleel-al-suez.com/prayer-times"
                }
            ]
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <PrayerTimesView initialPrayerTimes={prayerTimes} />
        </>
    );
}
