'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { LocateFixed } from 'lucide-react'
import { cn } from '@/lib/utils'

// Fix for default Leaflet marker icons in Next.js
const fixLeafletIcons = () => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

interface MapMarker {
    id: string
    position: [number, number]
    title: string
    description?: string
    slug?: string
    type?: 'place' | 'event'
}

interface Props {
    center?: [number, number]
    zoom?: number
    markers?: MapMarker[]
    onMarkerClick?: (marker: MapMarker) => void
    height?: string
}

const DEFAULT_CENTER: [number, number] = [29.9668, 32.5498] // Suez City Center

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, zoom)
    }, [center, zoom, map])
    return null
}

function LocateControl() {
    const map = useMap()
    const [loading, setLoading] = useState(false)

    const handleLocate = () => {
        setLoading(true)
        map.locate({ setView: true, maxZoom: 16 })
        map.once('locationfound', () => setLoading(false))
        map.once('locationerror', () => {
            setLoading(false)
            alert('تعذر تحديد الموقع. يرجى تفعيل الـ GPS')
        })
    }

    return (
        <div className="leaflet-top leaflet-left !top-[unset] !bottom-24 !left-4">
            <div className="leaflet-control leaflet-bar !border-none !shadow-lg">
                <button
                    onClick={handleLocate}
                    className={cn(
                        "w-10 h-10 bg-white hover:bg-muted flex items-center justify-center transition-colors rounded-xl",
                        loading && "animate-pulse"
                    )}
                    title="تحديد موقعي"
                >
                    <LocateFixed size={20} className="text-primary" />
                </button>
            </div>
        </div>
    )
}

export default function LeafletMap({
    center = DEFAULT_CENTER,
    zoom = 13,
    markers = [],
    onMarkerClick,
    height = "400px"
}: Props) {
    useEffect(() => {
        fixLeafletIcons()
    }, [])

    return (
        <div style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden' }} className="border border-border shadow-sm">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ZoomControl position="bottomright" />
                <MapUpdater center={center} zoom={zoom} />
                <LocateControl />

                {markers.map((marker) => (
                    <Marker
                        key={`${marker.type}-${marker.id}`}
                        position={marker.position}
                        eventHandlers={{
                            click: () => onMarkerClick?.(marker)
                        }}
                    >
                        <Popup>
                            <div className="p-1" dir="rtl">
                                <h3 className="font-bold text-sm mb-1">{marker.title}</h3>
                                {marker.description && <p className="text-xs text-muted-foreground line-clamp-2">{marker.description}</p>}
                                {marker.slug && (
                                    <a
                                        href={marker.type === 'event' ? `/events/${marker.slug}` : `/places/${marker.slug}`}
                                        className="text-primary text-[10px] font-bold mt-2 block hover:underline"
                                    >
                                        عرض التفاصيل ←
                                    </a>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}
