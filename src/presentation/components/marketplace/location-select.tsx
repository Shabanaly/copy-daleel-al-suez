import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import { createAreaAction } from '@/actions/area.actions';
import { translateAndSlugify } from '@/app/actions/translate';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface LocationSelectProps {
    value: string; // This expects area_id now
    onChange: (id: string, name?: string) => void;
    error?: string;
}

export function LocationSelect({ value, onChange, error }: LocationSelectProps) {
    const router = useRouter();
    const [areas, setAreas] = useState<{ id: string; name: string; district_id?: string }[]>([]);
    const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    // Quick Area State
    const [isAddingArea, setIsAddingArea] = useState(false);
    const [newAreaName, setNewAreaName] = useState('');
    const [newAreaDistrictId, setNewAreaDistrictId] = useState('');
    const [isCreatingArea, setIsCreatingArea] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            // Fetch both areas and districts
            const [areasRes, districtsRes] = await Promise.all([
                supabase.from('areas').select('id, name, district_id').eq('is_active', true).order('name'),
                supabase.from('districts').select('id, name').order('name')
            ]);

            if (areasRes.error) console.error('Supabase Areas Error:', areasRes.error);
            if (districtsRes.error) console.error('Supabase Districts Error:', districtsRes.error);

            if (areasRes.data) setAreas(areasRes.data);
            if (districtsRes.data) setDistricts(districtsRes.data);

            setLoading(false);
        };

        fetchData();
    }, []);

    const handleAddArea = async () => {
        if (!newAreaName.trim()) return;
        if (!newAreaDistrictId) {
            toast.error('يرجى اختيار الحي التابع له');
            return;
        }

        setIsCreatingArea(true);
        try {
            const slug = await translateAndSlugify(newAreaName);
            const result = await createAreaAction({
                name: newAreaName.trim(),
                slug,
                districtId: newAreaDistrictId,
                isActive: true
            });

            if (result.success && result.data) {
                if (result.isDuplicate) {
                    toast.info(`المنطقة "${newAreaName}" موجودة بالفعل، تم اختيارها لك.`);
                } else {
                    toast.success(`تمت إضافة منطقة "${newAreaName}" بنجاح!`);
                }

                // Add to local state to avoid full re-fetch
                setAreas((prev: any[]) => [...prev, {
                    id: result.data!.id,
                    name: result.data!.name,
                    district_id: newAreaDistrictId
                }]);

                onChange(result.data.id, result.data.name);
                setIsAddingArea(false);
                setNewAreaName('');
                setNewAreaDistrictId('');
                router.refresh();
            } else {
                toast.error(result.error || 'حدث خطأ أثناء إضافة المنطقة');
            }
        } catch (error) {
            toast.error('حدث خطأ غير متوقع');
        } finally {
            setIsCreatingArea(false);
        }
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-foreground">الموقع</label>
                <button
                    type="button"
                    onClick={() => setIsAddingArea(!isAddingArea)}
                    className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded hover:bg-primary/20 transition-colors flex items-center gap-1"
                >
                    <Plus size={10} />
                    إضافة منطقة جديدة
                </button>
            </div>

            {isAddingArea ? (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 bg-primary/5 p-3 rounded-xl border border-primary/20 mb-3">
                    <input
                        type="text"
                        value={newAreaName}
                        onChange={(e) => setNewAreaName(e.target.value)}
                        placeholder="اسم المنطقة (مثلاً: شارع النيل)"
                        className="w-full px-3 py-2 bg-background border border-primary/30 rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary"
                    />
                    <select
                        value={newAreaDistrictId}
                        onChange={(e) => setNewAreaDistrictId(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-primary/30 rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                        <option value="">اختر الحي الرئيسي...</option>
                        {districts.map((d: any) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={handleAddArea}
                        disabled={isCreatingArea}
                        className="bg-primary text-primary-foreground p-2 rounded-xl hover:brightness-110 active:scale-95 transition-all text-sm font-bold disabled:opacity-50"
                    >
                        {isCreatingArea ? <Loader2 size={16} className="animate-spin m-auto" /> : 'حفظ المنطقة الجديدة'}
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <select
                        value={value}
                        onChange={(e) => {
                            const selectedId = e.target.value;
                            const selectedArea = areas.find((a: any) => a.id === selectedId);
                            onChange(selectedId, selectedArea?.name);
                        }}
                        disabled={loading}
                        className={`w-full px-4 py-3 pr-10 rounded-xl border outline-none appearance-none bg-muted ${error ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'} ${loading ? 'opacity-50' : ''}`}
                    >
                        <option value="">{loading ? 'جاري تحميل المناطق...' : 'اختر المنطقة'}</option>

                        {/* Grouped Areas by District */}
                        {districts.map((district: any) => {
                            const districtAreas = areas.filter((a: any) => a.district_id === district.id);
                            if (districtAreas.length === 0) return null;

                            return (
                                <optgroup key={district.id} label={district.name} className="bg-background font-bold text-primary">
                                    {districtAreas.map((area: any) => (
                                        <option key={area.id} value={area.id} className="text-foreground font-normal">
                                            {area.name}
                                        </option>
                                    ))}
                                </optgroup>
                            );
                        })}

                        {/* Fallback for areas without district or with orphan district IDs */}
                        {(() => {
                            const districtIds = districts.map((d: any) => d.id);
                            const orphanAreas = areas.filter((a: any) => !a.district_id || !districtIds.includes(a.district_id));

                            if (orphanAreas.length === 0) return null;

                            return (
                                <optgroup label={districts.length > 0 ? "أخرى" : "كل المناطق"} className="bg-background font-bold">
                                    {orphanAreas.map((area: any) => (
                                        <option key={area.id} value={area.id} className="text-foreground font-normal">
                                            {area.name}
                                        </option>
                                    ))}
                                </optgroup>
                            );
                        })()}
                    </select>
                    <MapPin className="absolute left-3 top-3.5 text-muted-foreground w-5 h-5 pointer-events-none" />
                    <div className="absolute right-3 top-3.5 pointer-events-none">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            )}
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}
