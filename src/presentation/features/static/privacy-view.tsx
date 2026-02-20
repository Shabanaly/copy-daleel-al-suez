export function PrivacyView() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold text-foreground mb-8 border-b border-border pb-4">سياسة الخصوصية</h1>

            <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-6">
                <p>
                    نحترم في &quot;دليل السويس&quot; خصوصيتكم ونلتزم بحماية بياناتكم الشخصية. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتكم.
                </p>

                <section>
                    <h3 className="text-xl font-bold text-foreground mb-2">1. المعلومات التي نجمعها</h3>
                    <p>
                        قد نجمع معلومات شخصية مثل الاسم، البريد الإلكتروني، ورقم الهاتف عند التسجيل أو التواصل معنا. كما نقوم بجمع بيانات تقنية مثل عنوان IP ونوع المتصفح لتحسين تجربة الاستخدام.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-foreground mb-2">2. كيفية استخدام المعلومات</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>لتقديم وتحسين خدماتنا.</li>
                        <li>للتواصل معكم بخصوص حسابكم أو استفساراتكم.</li>
                        <li>لإرسال تحديثات أو عروض ترويجية (يمكنكم إلغاء الاشتراك في أي وقت).</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-foreground mb-2">3. مشاركة المعلومات</h3>
                    <p>
                        لا نقوم ببيع أو تأجير بياناتكم الشخصية لأطراف ثالثة. قد نشارك بيانات مجهولة الهوية لأغراض التحليل والإحصاء.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-foreground mb-2">4. أمن البيانات</h3>
                    <p>
                        نستخدم إجراءات أمنية تقنية وإدارية تتناسب مع طبيعة البيانات التي نحتفظ بها لحمايتها من الوصول غير المصرح به.
                    </p>
                </section>

                <p className="text-sm text-muted-foreground mt-8">
                    آخر تحديث: فبراير 2026
                </p>
            </div>
        </div>
    )
}
