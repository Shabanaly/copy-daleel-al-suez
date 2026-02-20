interface GoogleMapEmbedProps {
    mapLink?: string
    placeName: string
    address?: string
}

export function GoogleMapEmbed({ mapLink, placeName, address }: GoogleMapEmbedProps) {
    // Helper to extract query for the map
    const getMapQuery = () => {
        if (!mapLink) return `${placeName}, ${address || ''}`

        try {
            const url = new URL(mapLink)
            // If it's a google maps link with 'q' param
            if (url.searchParams.has('q')) {
                return url.searchParams.get('q')
            }
            // If it's a short link or specific place link, ideally we'd need to expand it, 
            // but for now we fallback to place details
        } catch {
            // Invalid URL
        }

        // Fallback: use exact address or place name
        return `${placeName}, ${address || 'Suez, Egypt'}`
    }

    const query = encodeURIComponent(getMapQuery() || '')
    const embedUrl = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`

    if (!mapLink && !address) {
        return (
            <div className="h-64 md:h-80 bg-muted rounded-xl flex flex-col items-center justify-center text-muted-foreground text-sm gap-2 border border-border">
                <span className="text-3xl">🗺️</span>
                <span>الخريطة غير متوفرة</span>
            </div>
        )
    }

    return (
        <div className="rounded-xl overflow-hidden border border-border shadow-sm h-64 md:h-80 relative bg-muted group">
            <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                className="w-full h-full filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                title={`${placeName} Map`}
                loading="lazy"
            ></iframe>

            {/* Overlay to open in new tab (optional, but good for UX) */}
            <a
                href={mapLink || `https://www.google.com/maps/search/?api=1&query=${query}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1 text-primary"
            >
                فتح في خرائط جوجل
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
        </div>
    )
}
