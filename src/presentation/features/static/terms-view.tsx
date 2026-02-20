export function TermsView() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold text-foreground mb-8 border-b border-border pb-4">الشروط والأحكام</h1>

            <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-6">
                <p>
                    مرحباً بكم في &quot;دليل السويس&quot;. باستخداكم لهذا الموقع، فإنكم توافقون على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية.
                </p>

                <section>
                    <h3 className="text-xl font-bold text-foreground mb-2">1. الاستخدام المقبول</h3>
                    <p>
                        تتعهدون باستخدام الموقع لأغراض قانونية فقط، وتجنب أي سلوك يضر بالموقع أو بمستخدميه الآخرين. يُمنع منعاً باتاً نشر أي محتوى مسيء، غير قانوني، أو ينتهك حقوق الآخرين.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-foreground mb-2">2. حقوق الملكية الفكرية</h3>
                    <p>
                        جميع المحتويات الموجودة على الموقع من نصوص، صور، وشعارات هي ملك لـ &quot;دليل السويس&quot; أو مرخصة له، وهي محمية بموجب قوانين حقوق النشر.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-foreground mb-2">3. دقة المعلومات</h3>
                    <p>
                        نبذل قصارى جهدنا لضمان دقة المعلومات الواردة في الدليل، ولكننا لا نضمن خلوها تماماً من الأخطاء. استخدامكم للمعلومات يكون على مسؤوليتكم الشخصية.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-foreground mb-2">4. التعديلات</h3>
                    <p>
                        نحتفظ بالحق في تعديل هذه الشروط في أي وقت. يعتبر استمرار استخداكم للموقع بعد نشر التعديلات موافقة منكم عليها.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-foreground mb-2">5. إخلاء المسؤولية</h3>
                    <p>
                        نحن نخلي مسؤوليتنا عن أي أضرار مباشرة أو غير مباشرة قد تنشأ عن استخدام الموقع أو عدم القدرة على استخدامه.
                    </p>
                </section>
            </div>
        </div>
    )
}
