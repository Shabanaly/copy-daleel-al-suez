'use client';

import { Filter, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";



export function MarketplaceFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [isOpen, setIsOpen] = useState(false);
    // Keep category state to preserve it when applying other filters, even if not shown in UI
    const category = searchParams.get('category') || '';
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

    const handleSearch = () => {
        let params = new URLSearchParams(searchParams.toString());

        if (minPrice) params.set('minPrice', minPrice);
        else params.delete('minPrice');

        if (maxPrice) params.set('maxPrice', maxPrice);
        else params.delete('maxPrice');

        // Note: We don't touch 'category' here because we don't control it from this form anymore.
        // But since we start with `searchParams`, the existing category (from header) is preserved.

        router.push(`${pathname}?${params.toString()}`);
        setIsOpen(false);
    };

    const handleClear = () => {
        // Clear only price, leave category/search loop? 
        // Or clear all? User said "Clear All". 
        // If sidebar is just Price, "Clear All" usually implies clearing *this* form.
        // But let's assume it clears everything for safety, or maybe just prices.
        // Let's clear prices.
        setMinPrice('');
        setMaxPrice('');

        const params = new URLSearchParams(searchParams.toString());
        params.delete('minPrice');
        params.delete('maxPrice');
        // keep category and search?
        // simple approach: push current path with preserved params minus price
        router.push(`${pathname}?${params.toString()}`);
        setIsOpen(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    تصفية السعر
                </h2>
                {(minPrice || maxPrice) && (
                    <button
                        onClick={handleClear}
                        className="text-sm text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                        <X className="w-4 h-4" />
                        مسح
                    </button>
                )}
            </div>

            <div className="space-y-8">
                {/* Categories removed as per user request, relying on Header Tabs */}

                {/* Price Range */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">السعر</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="من"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-center"
                            />
                            <span className="absolute left-4 top-3.5 text-xs text-gray-400 font-medium">ج.م</span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="إلى"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-center"
                            />
                            <span className="absolute left-4 top-3.5 text-xs text-gray-400 font-medium">ج.م</span>
                        </div>
                    </div>
                </div>

                {/* Apply Button */}
                <button
                    onClick={handleSearch}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                    <Filter className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    تطبيق الفلاتر
                </button>
            </div>
        </div>
    );
}
