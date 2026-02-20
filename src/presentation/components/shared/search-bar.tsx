'use client'

import { Search, MapPin } from 'lucide-react'

interface SearchBarProps {
    className?: string
}

export function SearchBar({ className }: SearchBarProps) {
    return (
        <div className={`relative max-w-3xl mx-auto w-full ${className}`}>
            <div className="flex flex-col md:flex-row shadow-lg rounded-2xl overflow-hidden bg-white divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-100">

                {/* Search Input */}
                <div className="flex-1 flex items-center px-4 py-3 md:py-4">
                    <Search className="flex-shrink-0 w-5 h-5 text-slate-400 ml-3" />
                    <input
                        type="text"
                        placeholder="عن ماذا تبحث؟ (مطعم، دكتور، محل...)"
                        className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                    />
                </div>

                {/* Location/Area Input (Optional) */}
                <div className="flex-1 flex items-center px-4 py-3 md:py-4">
                    <MapPin className="flex-shrink-0 w-5 h-5 text-slate-400 ml-3" />
                    <select className="w-full bg-transparent outline-none text-slate-800 appearance-none cursor-pointer">
                        <option value="">كل المناطق</option>
                        <option value="arbaean">الأربعين</option>
                        <option value="suez">السويس</option>
                        <option value="faisal">فيصل</option>
                        <option value="ataqa">عتاقة</option>
                        <option value="ganayen">الجناين</option>
                    </select>
                </div>

                {/* Search Button */}
                <button className="bg-primary hover:brightness-110 text-primary-foreground px-8 py-3 md:py-4 font-medium transition-colors">
                    بحث
                </button>
            </div>
        </div>
    )
}
