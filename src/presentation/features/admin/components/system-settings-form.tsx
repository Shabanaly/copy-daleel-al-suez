'use client'

import { useState, useTransition } from 'react'
import { Save, Settings2, Shield, Palette, Layout, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { updateSettingAction } from '@/actions/admin-settings.actions'
import { Button } from '@/presentation/ui/button'
import { cn } from '@/lib/utils'

interface Setting {
    key: string
    value: string
    group: string
    type: string
    label: string
    description: string
}

interface Props {
    initialSettings: Setting[]
}

const GROUPS = [
    { id: 'general', label: 'إعدادات عامة', icon: Settings2 },
    { id: 'appearance', label: 'المظهر والهوية', icon: Palette },
    { id: 'system', label: 'إعدادات النظام', icon: Shield },
    { id: 'contact', label: 'بيانات التواصل', icon: Globe },
]

export function SystemSettingsForm({ initialSettings }: Props) {
    const [activeGroup, setActiveGroup] = useState('general')
    const [values, setValues] = useState<Record<string, string>>(
        initialSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
    )
    const [isPending, startTransition] = useTransition()

    const filteredSettings = initialSettings.filter(s => s.group === activeGroup)

    const handleSave = async (key: string) => {
        startTransition(async () => {
            const result = await updateSettingAction(key, values[key])
            if (result.success) toast.success(`تم حفظ ${key}`)
            else toast.error(result.error)
        })
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1 space-y-1">
                {GROUPS.map((group) => (
                    <button
                        key={group.id}
                        onClick={() => setActiveGroup(group.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                            activeGroup === group.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <group.icon size={18} />
                        {group.label}
                    </button>
                ))}
            </div>

            {/* Settings Form */}
            <div className="lg:col-span-3 space-y-4">
                {filteredSettings.length === 0 && (
                    <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
                        <p className="text-muted-foreground">لا توجد إعدادات في هذا القسم حالياً.</p>
                    </div>
                )}

                {filteredSettings.map((setting) => (
                    <div key={setting.key} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start gap-4 mb-4">
                            <div>
                                <label className="block font-bold text-sm mb-1">{setting.label}</label>
                                <p className="text-xs text-muted-foreground">{setting.description}</p>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSave(setting.key)}
                                disabled={isPending || values[setting.key] === initialSettings.find(s => s.key === setting.key)?.value}
                            >
                                <Save size={14} className="ml-2" />
                                حفظ
                            </Button>
                        </div>

                        {setting.type === 'boolean' ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={values[setting.key] === 'true'}
                                    onChange={(e) => setValues(prev => ({ ...prev, [setting.key]: e.target.checked ? 'true' : 'false' }))}
                                    className="w-4 h-4 text-primary rounded"
                                />
                                <span className="text-sm">{values[setting.key] === 'true' ? 'مفعل' : 'معطل'}</span>
                            </div>
                        ) : setting.type === 'json' ? (
                            <textarea
                                value={values[setting.key]}
                                onChange={(e) => setValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
                                className="w-full min-h-[100px] p-3 text-xs font-mono bg-muted/50 rounded-xl border-none focus:ring-1 focus:ring-primary"
                                dir="ltr"
                            />
                        ) : (
                            <input
                                type="text"
                                value={values[setting.key]}
                                onChange={(e) => setValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
                                className="w-full h-10 px-3 text-sm bg-muted/50 rounded-lg border-none focus:ring-1 focus:ring-primary"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
