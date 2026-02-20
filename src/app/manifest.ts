import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'دليل السويس',
        short_name: 'دليل السويس',
        description: 'الدليل الشامل لمدينة السويس. اكتشف أفضل المطاعم، والكافيهات، والخدمات.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
