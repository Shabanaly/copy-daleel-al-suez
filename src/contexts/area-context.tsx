'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { getDistanceFromLatLonInKm } from '@/lib/location-utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export interface Area {
    id: string;
    name: string;
    slug: string;
    latitude: number;
    longitude: number;
}

interface AreaContextType {
    areas: Area[];
    currentArea: Area | null;
    setCurrentArea: (area: Area | null) => void;
    isLoading: boolean;
    locationError: string | null;
    detectNearestArea: () => void;
}

const AreaContext = createContext<AreaContextType | undefined>(undefined);

export function AreaProvider({ children }: { children: React.ReactNode }) {
    const [areas, setAreas] = useState<Area[]>([])
    // Lazy initialization from localStorage
    const [currentArea, setCurrentArea] = useState<Area | null>(null)
    const [isHydrated, setIsHydrated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [retryCounter, setRetryCounter] = useState(0)
    const { latitude, longitude, error: geoError, getLocation } = useGeolocation()

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
                .select('*')
                .eq('is_active', true)
                .order('name')

            if (error) {
                console.error('Error fetching areas:', error)
            } else if (data) {
                setAreas(data)
                console.log(`📍 [AreaContext] Loaded ${data.length} areas`)
            }
            setIsLoading(false)
        }

        fetchAreas()
    }, [])

    // Persistence Effect (Saves on every change after hydration)
    useEffect(() => {
        if (!isHydrated) return;

        if (currentArea) {
            localStorage.setItem('daleel_current_area', JSON.stringify(currentArea))
        } else {
            localStorage.removeItem('daleel_current_area')
        }
    }, [currentArea, isHydrated])

    // Effect to auto-detect area
    // Runs when:
    // 1. Location changes (lat/long)
    // 2. Areas are loaded
    // 3. User clicks "Locate Me" (increments retryCounter)
    // 4. No area is currently selected (or we just reset it)
    useEffect(() => {
        // If we have location and areas, try to find match
        if (latitude && longitude && areas.length > 0) {
            // Only run if NO area is selected, OR if this was triggered by a manual retry
            if (!currentArea || retryCounter > 0) {
                findAndSetNearestArea(latitude, longitude)
            }
        } else if (retryCounter > 0 && !latitude && !longitude) {
            // User clicked retry but we don't have location yet?
            // getLocation() updates state async. If we are here, maybe still loading or error?
            // If error exists, we rely on the UI to show it.
        }
    }, [latitude, longitude, areas, currentArea, retryCounter])

    const findAndSetNearestArea = (lat: number, lon: number) => {
        let minDistance = Infinity
        let nearest: Area | null = null

        // Default max distance to consider (e.g., 50km? Or unlimited?)
        // For now, let's just find the absolute nearest.
        areas.forEach(area => {
            const dist = getDistanceFromLatLonInKm(lat, lon, area.latitude, area.longitude)
            if (dist < minDistance) {
                minDistance = dist
                nearest = area
            }
        })

        if (nearest) {
            const n = nearest as Area
            console.log(`Detected nearest area: ${n.name} (${minDistance.toFixed(2)}km)`)
            setCurrentArea(n)
            toast.success(`تم تحديد منطقتك: ${n.name} (الأقرب إليك)`)
        } else {
            console.log('No nearest area found within range.')
            toast.error('لم يتم العثور على منطقة قريبة.')
        }
    }

    const detectNearestArea = () => {
        setCurrentArea(null) // Reset selection
        setRetryCounter(p => p + 1) // Force effect to re-run even if location hasn't changed
        getLocation() // Request fresh location
    }

    return (
        <AreaContext.Provider value={{
            areas,
            currentArea,
            setCurrentArea,
            isLoading,
            locationError: geoError,
            detectNearestArea
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
