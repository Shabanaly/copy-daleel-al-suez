// Server action to get weather data
'use server'

interface WeatherData {
    temp: number
    feels_like: number
    humidity: number
    description: string
    icon: string
    city: string
}

export async function getWeatherData(): Promise<WeatherData | null> {
    try {
        const API_KEY = process.env.OPENWEATHER_API_KEY

        // If no API key, return mock data for development
        if (!API_KEY) {
            console.warn('OpenWeather API key not found, using mock data')
            return {
                temp: 28,
                feels_like: 30,
                humidity: 65,
                description: 'صافي',
                icon: '01d',
                city: 'السويس'
            }
        }

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=Suez,EG&units=metric&lang=ar&appid=${API_KEY}`,
            { next: { revalidate: 1800 } } // Cache for 30 minutes
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
            city: 'السويس'
        }
    } catch (error) {
        console.error('Error fetching weather:', error)
        // Return mock data as fallback
        return {
            temp: 28,
            feels_like: 30,
            humidity: 65,
            description: 'صافي',
            icon: '01d',
            city: 'السويس'
        }
    }
}
