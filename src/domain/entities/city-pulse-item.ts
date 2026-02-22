export type PulseIconType = 'sparkles' | 'trending' | 'mappin' | 'zap' | 'info' | 'calendar';
export type PulseSourceType = 'manual' | 'event' | 'auto';

export interface CityPulseItem {
    id: string;
    text: string;
    iconType: PulseIconType;
    isActive: boolean;
    startsAt?: string | null;
    endsAt?: string | null;
    priority: number;
    source: PulseSourceType;
    sourceId?: string | null;
    createdAt: string;
}
