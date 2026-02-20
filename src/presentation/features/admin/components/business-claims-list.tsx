'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, FileText, Smartphone, User, MapPin, Eye, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { processClaimAction } from '@/actions/admin-claims.actions'
import { Button } from '@/presentation/ui/button'
import Image from 'next/image'

interface Props {
    pendingClaims: any[]
}

export function BusinessClaimsList({ pendingClaims }: Props) {
    const [isPending, startTransition] = useTransition()
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [reason, setReason] = useState('')
    const router = useRouter()

    const handleProcess = async (id: string, status: 'approved' | 'rejected') => {
        if (status === 'rejected' && !reason.trim()) {
            toast.error('يرجى ذكر سبب الرفض')
            return
        }

        startTransition(async () => {
            const result = await processClaimAction(id, status, reason)
            if (result.success) {
                toast.success(status === 'approved' ? 'تم توثيق المحل بنجاح ✅' : 'تم رفض الطلب')
                setRejectingId(null)
                setReason('')
                router.refresh()
            } else {
                toast.error(result.error || 'حدث خطأ')
            }
        })
    }

    if (pendingClaims.length === 0) {
        return (
            <div className="py-20 text-center bg-card rounded-2xl border border-dashed border-border">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                    <Check size={32} />
                </div>
                <h3 className="text-xl font-bold">لا توجد طلبات معلقة</h3>
                <p className="text-muted-foreground mt-1">كل طلبات التوثيق تم التعامل معها.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingClaims.map((claim) => (
                <div key={claim.id} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6 space-y-4 flex-1">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg leading-tight">{claim.fullName}</h3>
                                <p className="text-sm text-primary font-medium flex items-center gap-1.5">
                                    <MapPin size={14} />
                                    {claim.place?.name}
                                </p>
                            </div>
                            <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-100 italic">
                                بانتظار المراجعة
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="bg-muted/50 p-3 rounded-xl border border-border/50">
                                <span className="text-muted-foreground block mb-1">الصفة الوظيفية</span>
                                <span className="font-bold">{claim.businessRole}</span>
                            </div>
                            <div className="bg-muted/50 p-3 rounded-xl border border-border/50">
                                <span className="text-muted-foreground block mb-1">رقم الهاتف</span>
                                <span className="font-bold flex items-center gap-1 ml-auto" dir="ltr">
                                    {claim.phone}
                                    <Smartphone size={12} className="text-muted-foreground" />
                                </span>
                            </div>
                        </div>

                        {claim.additionalNotes && (
                            <div className="bg-muted/30 p-3 rounded-xl border border-border/50 italic text-sm text-muted-foreground">
                                "{claim.additionalNotes}"
                            </div>
                        )}

                        {claim.proofImageUrl && (
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">مستند الإثبات</span>
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-muted group border border-border">
                                    <Image
                                        src={claim.proofImageUrl}
                                        alt="Proof"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                        unoptimized
                                    />
                                    <a
                                        href={claim.proofImageUrl}
                                        target="_blank"
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold"
                                    >
                                        <Eye size={24} className="ml-2" />
                                        فتح في نافذة جديدة
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-muted/20 border-t border-border mt-auto">
                        {rejectingId === claim.id ? (
                            <div className="space-y-3">
                                <textarea
                                    placeholder="اكتب سبب الرفض هنا ليظهر للمستخدم..."
                                    className="w-full h-20 p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1"
                                        variant="destructive"
                                        onClick={() => handleProcess(claim.id, 'rejected')}
                                        disabled={isPending}
                                    >
                                        إتمام الرفض
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setRejectingId(null)
                                            setReason('')
                                        }}
                                        disabled={isPending}
                                    >
                                        تراجع
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700 font-bold"
                                    onClick={() => handleProcess(claim.id, 'approved')}
                                    disabled={isPending}
                                >
                                    <Check size={18} className="ml-2" />
                                    الموافقة والتوثيق
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                    onClick={() => setRejectingId(claim.id)}
                                    disabled={isPending}
                                >
                                    <X size={18} className="ml-2" />
                                    رفض الطلب
                                </Button>
                                <a
                                    href={`/places/${claim.place?.slug}`}
                                    target="_blank"
                                    className="p-2 bg-white border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                                    title="معاينة المكان"
                                >
                                    <ExternalLink size={18} className="text-muted-foreground" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
