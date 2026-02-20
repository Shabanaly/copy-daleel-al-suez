import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MapPin } from 'lucide-react';

interface LocationSelectProps {
    value: string; // This expects area_id now
    onChange: (id: string, name?: string) => void;
    error?: string;
}

export function LocationSelect({ value, onChange, error }: LocationSelectProps) {
    const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAreas = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('areas')
                .select('id, name')
                .eq('is_active', true)
                .order('name');

            if (data) {
                setAreas(data);
            }
            setLoading(false);
        };

        fetchAreas();
    }, []);

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium mb-1 text-foreground">الموقع</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedArea = areas.find(a => a.id === selectedId);
                        // Handle change. Note: Parent expects string (ID or Name). 
                        // We will pass ID here, but parent logic might need adjustment if it expects Name.
                        // Ideally we pass ID, and parent handles looking up name if needed.
                        onChange(selectedId, selectedArea?.name);
                    }}
                    disabled={loading}
                    className={`w-full px-4 py-3 pr-10 rounded-xl border outline-none appearance-none bg-muted ${error ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'} ${loading ? 'opacity-50' : ''}`}
                >
                    <option value="">{loading ? 'جاري تحميل المناطق...' : 'اختر المنطقة'}</option>
                    {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                            {area.name}
                        </option>
                    ))}
                </select>
                <MapPin className="absolute left-3 top-3.5 text-muted-foreground w-5 h-5 pointer-events-none" />
                <div className="absolute right-3 top-3.5 pointer-events-none">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}
