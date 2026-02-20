export function AboutView() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold text-foreground mb-8 border-b border-border pb-4">عن دليل السويس</h1>

            <div className="prose prose-lg text-muted-foreground leading-relaxed">
                <p>
                    مرحباً بكم في <strong>دليل السويس</strong>، بوابتك الشاملة لاستكشاف كل ما تقدمه مدينة السويس الباسلة.
                </p>
                <p>
                    نحن منصة محلية تهدف إلى تسهيل الحياة اليومية لسكان وزوار السويس من خلال توفير دليل شامل ومحدث لأفضل الأماكن والخدمات في المدينة. سواء كنت تبحث عن مطعم مميز، كافيه هادئ، عيادة طبية، أو ورشة صيانة، فإن دليل السويس هو وجهتك الأولى.
                </p>

                <h3 className="text-xl font-bold text-foreground mt-8 mb-4">رسالتنا</h3>
                <p>
                    تمكين المجتمع المحلي ودعم الأنشطة التجارية الصغيرة والمتوسطة من خلال توفير منصة عرض احترافية تبرز جودة خدماتهم وتسهل وصول العملاء إليهم.
                </p>

                <h3 className="text-xl font-bold text-foreground mt-8 mb-4">ماذا نقدم؟</h3>
                <ul className="list-disc list-inside space-y-2">
                    <li>قاعدة بيانات شاملة للمطاعم والكافيهات والمحلات التجارية.</li>
                    <li>دليل للخدمات الطبية والعيادات والصيدليات.</li>
                    <li>معلومات التواصل والعناوين ومواعيد العمل بدقة.</li>
                    <li>إمكانية البحث المتقدم للوصول إلى ما تحتاجه بسرعة.</li>
                </ul>

                <p className="mt-8">
                    نسعى دائماً لتطوير خدماتنا وتحديث بياناتنا لنكون الدليل رقم 1 في السويس. شكراً لثقتكم بنا.
                </p>
            </div>
        </div>
    )
}
