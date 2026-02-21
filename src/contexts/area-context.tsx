'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Area {
    id: string;
    name: string;
    slug: string;
    districtId?: string;
}

interface AreaContextType {
    areas: Area[];
    currentArea: Area | null;
    setCurrentArea: (area: Area | null) => void;
    isLoading: boolean;
}

const AreaContext = createContext<AreaContextType | undefined>(undefined);

export function AreaProvider({ children }: { children: React.ReactNode }) {
    const [areas, setAreas] = useState<Area[]>([])
    const [currentArea, setCurrentArea] = useState<Area | null>(null)
    const [isHydrated, setIsHydrated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch areas and hydrate from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('daleel_current_area')
        if (saved) {
            try {
                setCurrentArea(JSON.parse(saved))
            } catch (e) {
                console.error('Error parsing saved area:', e)
            }
        }
        setIsHydrated(true)

        async function fetchAreas() {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('areas')
                .select('id, name, slug, district_id')
                .eq('is_active', true)
                .order('name')

            if (error) {
                console.error('Error fetching areas:', error)
            } else if (data) {
                const mappedAreas = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    slug: item.slug,
                    districtId: item.district_id
                }))
                setAreas(mappedAreas)
                console.log(`📍 [AreaContext] Loaded ${mappedAreas.length} areas`)
            }
            setIsLoading(false)
        }

        fetchAreas()
    }, [])

    // Persistence Effect
    useEffect(() => {
        if (!isHydrated) return;

        if (currentArea) {
            localStorage.setItem('daleel_current_area', JSON.stringify(currentArea))
        } else {
            localStorage.removeItem('daleel_current_area')
        }
    }, [currentArea, isHydrated])

    return (
        <AreaContext.Provider value={{
            areas,
            currentArea,
            setCurrentArea,
            isLoading
        }}>
            {children}
        </AreaContext.Provider>
    )
}

export function useArea() {
    const context = useContext(AreaContext);
    if (context === undefined) {
        // Log a warning instead of crashing. This helps diagnose without white-screening the app.
        console.warn('⚠️ [useArea] used outside of AreaProvider. Returning fallback state.');
        return {
            areas: [],
            currentArea: null,
            setCurrentArea: () => { },
            isLoading: false,
            locationError: null,
            detectNearestArea: () => { }
        };
    }
    return context;
}
