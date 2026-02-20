import { Mail, Phone, MapPin } from 'lucide-react'

export function ContactView() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold text-foreground mb-8 border-b border-border pb-4">تواصل معنا</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <p className="text-muted-foreground mb-8 leading-relaxed">
                        نسعد دائماً بتواصلكم معنا. سواء كان لديكم استفسار، اقتراح للتطوير، أو رغبة في إضافة نشاطكم التجاري إلى الدليل، فريقنا جاهز للرد عليكم.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">البريد الإلكتروني</h3>
                                <p className="text-sm">support@daleel-suez.com</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">الهاتف (واتساب)</h3>
                                <p className="text-sm">+20 100 000 0000</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">العنوان</h3>
                                <p className="text-sm">السويس، مصر</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                    <h3 className="text-xl font-bold text-foreground mb-6">أرسل لنا رسالة</h3>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">الاسم</label>
                            <input type="text" className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">البريد الإلكتروني</label>
                            <input type="email" className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">الرسالة</label>
                            <textarea rows={4} className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground"></textarea>
                        </div>
                        <button type="button" className="w-full py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:brightness-110 transition-colors">
                            إرسال
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
