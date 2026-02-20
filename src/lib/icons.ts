import {
    LucideIcon,
    // General
    Folder, Star, Heart, Info, Home, MapPin, Globe, Flag, Bell, Calendar,
    // Food & Drink
    Utensils, Coffee, Pizza, CakeSlice, Wine, Beer, CupSoda, Sandwich,
    // Shopping
    ShoppingBag, ShoppingCart, Tag, Gift, CreditCard, Store, Ticket, Percent,
    // Places & Travel
    Car, Plane, Train, Bus, Bike, Hotel, Mountain, Palmtree, Tent, Anchor,
    // Services & Health
    Stethoscope, Dumbbell, GraduationCap, Briefcase, Wrench, Scissors, Hammer, Construction,
    // Entertainment & Tech
    Music, Camera, Wifi, Laptop, Smartphone, Gamepad, Tv, Radio, Headphones,
    // Nature
    Sun, Moon, Cloud, Zap, Droplets, Flame, Wind
} from 'lucide-react'

// Centralized Map of all icons used in the app
export const ICON_MAP: Record<string, LucideIcon> = {
    // General
    Folder, Star, Heart, Info, Home, MapPin, Globe, Flag, Bell, Calendar,
    // Food
    Utensils, Coffee, Pizza, CakeSlice, Wine, Beer, CupSoda, Sandwich,
    // Shopping
    ShoppingBag, ShoppingCart, Tag, Gift, CreditCard, Store, Ticket, Percent,
    // Places
    Car, Plane, Train, Bus, Bike, Hotel, Mountain, Palmtree, Tent, Anchor,
    // Services
    Stethoscope, Dumbbell, GraduationCap, Briefcase, Wrench, Scissors, Hammer, Construction,
    // Tech
    Music, Camera, Wifi, Laptop, Smartphone, Gamepad, Tv, Radio, Headphones,
    // Nature
    Sun, Moon, Cloud, Zap, Droplets, Flame, Wind
}

export const getIconComponent = (name: string) => {
    if (!name) return Folder

    // 1. Direct match (Fastest)
    if (ICON_MAP[name]) return ICON_MAP[name]

    // 2. Case-insensitive match (Fallback)
    const lowerName = name.toLowerCase()
    const foundKey = Object.keys(ICON_MAP).find(k => k.toLowerCase() === lowerName)

    return foundKey ? ICON_MAP[foundKey] : Folder
}
