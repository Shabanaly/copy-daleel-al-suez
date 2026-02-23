'use client'

import { Search, MapPin } from 'lucide-react'

interface SearchBarProps {
    className?: string
}

export function SearchBar({ className }: SearchBarProps) {
    return (
        <div className={`relative max-w-3xl mx-auto w-full group ${className}`}>
            <div className="flex flex-col md:flex-row shadow-lg rounded-2xl overflow-hidden bg-background border border-border group-hover:border-primary/30 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/50 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-border/50">

                {/* Search Input */}
                <div className="flex-1 flex items-center px-4 py-3 md:py-4 bg-muted/20 group-focus-within:bg-background transition-colors duration-300">
                    <Search className="flex-shrink-0 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="عن ماذا تبحث؟ (مطعم، دكتور، محل...)"
                        className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60 px-3"
                    />
                </div>

                {/* Location/Area Input (Optional) */}
                <div className="flex-1 flex items-center px-4 py-3 md:py-4 bg-muted/20 group-focus-within:bg-background transition-colors duration-300">
                    <MapPin className="flex-shrink-0 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <select className="w-full bg-transparent outline-none text-foreground appearance-none cursor-pointer px-3">
                        <option value="">كل المناطق</option>
                        <option value="arbaean">الأربعين</option>
                        <option value="suez">السويس</option>
                        <option value="faisal">فيصل</option>
                        <option value="ataqa">عتاقة</option>
                        <option value="ganayen">الجناين</option>
                    </select>
                </div>

                {/* Search Button */}
                <button className="bg-primary hover:brightness-110 active:scale-[0.98] text-primary-foreground px-8 py-3 md:py-4 font-bold transition-all">
                    بحث
                </button>
            </div>
        </div>
    )
}
