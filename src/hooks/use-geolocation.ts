import { useState, useEffect } from 'react';

interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    error: string | null;
    loading: boolean;
}

export const useGeolocation = () => {
    const [state, setState] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        error: null,
        loading: true, // Start loading immediately if we intend to fetch on mount, otherwise false
    });

    const getLocation = () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        if (!navigator.geolocation) {
            setState({
                latitude: null,
                longitude: null,
                error: 'Geolocation is not supported by your browser',
                loading: false,
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                    loading: false,
                });
            },
            (error) => {
                console.error('📍 [useGeolocation] Error:', {
                    code: error.code,
                    message: error.message
                })
                let errorMessage = 'Unable to retrieve your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        if (error.message.includes("secure origin")) {
                            errorMessage = "يجب استخدام HTTPS أو localhost لتفعيل خدمة الموقع."
                        } else {
                            errorMessage = 'تم رفض إذن الوصول للموقع. يرجى تفعيله من إعدادات المتصفح.';
                        }
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'معلومات الموقع غير متاحة حالياً.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'انتهت مهلة طلب الموقع.';
                        break;
                }
                setState({
                    latitude: null,
                    longitude: null,
                    error: errorMessage,
                    loading: false,
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000
            }
        );
    };

    return { ...state, getLocation };
};
