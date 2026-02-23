// Server action to get weather data
'use server'

interface WeatherData {
    temp: number
    feels_like: number
    humidity: number
    description: string
    icon: string
    city: string
    isFallback?: boolean
}

export async function getWeatherData(): Promise<WeatherData | null> {
    const getFallback = (): WeatherData => {
        const hour = new Date().getHours()
        const isNight = hour < 6 || hour > 18
        return {
            temp: isNight ? 22 : 28,
            feels_like: isNight ? 23 : 30,
            humidity: 60,
            description: isNight ? 'صافي (ليلاً)' : 'صافي',
            icon: isNight ? '01n' : '01d',
            city: 'السويس',
            isFallback: true
        }
    }

    try {
        const API_KEY = process.env.OPENWEATHER_API_KEY

        if (!API_KEY) {
            console.warn('OpenWeather API key not found, using fallback data')
            return getFallback()
        }

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=Suez,EG&units=metric&lang=ar&appid=${API_KEY}`,
            { next: { revalidate: 1800 } }
        )

        if (!response.ok) {
            throw new Error('Failed to fetch weather data')
        }

        const data = await response.json()

        return {
            temp: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            city: 'السويس',
            isFallback: false
        }
    } catch (error) {
        console.error('Error fetching weather:', error)
        return getFallback()
    }
}
