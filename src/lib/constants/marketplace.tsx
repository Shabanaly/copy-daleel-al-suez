import {
    Smartphone,
    Laptop,
    Tv,
    Gamepad2,
    Armchair,
    Shirt,
    Car,
    Home,
    Wrench,
    MoreHorizontal,
    ShoppingBag,
    Tablet,
    WashingMachine,
    Store,
    Baby,
    Dog,
    Dumbbell,
    Briefcase,
    HardHat,
    GraduationCap,
    BookOpen,
    Sprout,
    Hammer,
    ShoppingBasket,
    Heart,
    Music,
    Bike,
    CheckCircle2
} from 'lucide-react';
import { MarketplaceItemCategory, MarketplaceItemCondition } from '@/domain/entities/marketplace-item';

export interface Category {
    id: MarketplaceItemCategory | 'all';
    label: string;
    icon: any;
}


export const CATEGORY_ICONS: Record<string, any> = {
    'ShoppingBag': ShoppingBag,
    'shoppingbag': ShoppingBag,
    'Smartphone': Smartphone,
    'smartphone': Smartphone,
    'mobiles': Smartphone,
    'Tablet': Tablet,
    'tablet': Tablet,
    'Laptop': Laptop,
    'laptop': Laptop,
    'computers': Laptop,
    'Tv': Tv,
    'tv': Tv,
    'Gamepad2': Gamepad2,
    'gamepad2': Gamepad2,
    'WashingMachine': WashingMachine,
    'washingmachine': WashingMachine,
    'Armchair': Armchair,
    'armchair': Armchair,
    'Shirt': Shirt,
    'shirt': Shirt,
    'Car': Car,
    'car': Car,
    'Home': Home,
    'home': Home,
    'Wrench': Wrench,
    'wrench': Wrench,
    'MoreHorizontal': MoreHorizontal,
    'morehorizontal': MoreHorizontal,
    'other': MoreHorizontal,
    'Store': Store,
    'store': Store,
    'Baby': Baby,
    'baby': Baby,
    'Dog': Dog,
    'dog': Dog,
    'Dumbbell': Dumbbell, // For Hobbies
    'dumbbell': Dumbbell,
    'Briefcase': Briefcase,
    'briefcase': Briefcase,
    'HardHat': HardHat, // For Trade/Construction
    'hardhat': HardHat,
    'Construction': HardHat, // Alias
    'GraduationCap': GraduationCap,
    'graduationcap': GraduationCap,
    'education': GraduationCap,
    // New Categories
    'sports_hobbies': Dumbbell,
    'books': BookOpen,
    'bookopen': BookOpen,
    'kids_toys': Gamepad2,
    'agriculture': Sprout,
    'sprout': Sprout,
    'tools_equipment': Hammer,
    'hammer': Hammer,
    'food_products': ShoppingBasket,
    'shoppingbasket': ShoppingBasket,
    'health_beauty': Heart,
    'heart': Heart,
};


export const MARKETPLACE_CONDITIONS: { value: MarketplaceItemCondition; label: string }[] = [
    { value: 'new', label: 'جديد' },
    { value: 'like_new', label: 'مستعمل - كالجديد' },
    { value: 'good', label: 'مستعمل - بحالة جيدة' },
    { value: 'fair', label: 'مستعمل - بحالة مقبولة' },
    { value: 'for_parts', label: 'خردة / قطع غيار' },
];
