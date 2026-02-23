'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useClickOutside } from '@/hooks/use-click-outside';

interface SearchOption {
    id: string;
    label: string;
    slug: string;
}

interface SearchableDropdownProps {
    value: string; // The ID of the selected option
    onChange: (id: string, slug: string, label: string) => void;
    onSearch: (query: string) => Promise<SearchOption[]>;
    placeholder?: string;
    icon?: React.ReactNode;
}

export function SearchableDropdown({ value, onChange, onSearch, placeholder = 'ابحث...', icon }: SearchableDropdownProps) {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<SearchOption[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial value synchronization isn't strictly needed for our pure create form,
    // but good practice if we were editing. Here we just care about selection.

    useClickOutside(containerRef, () => {
        setIsOpen(false);
    });

    useEffect(() => {
        const fetchOptions = async () => {
            if (query.trim().length < 2) {
                setOptions([]);
                return;
            }

            setLoading(true);
            try {
                const results = await onSearch(query);
                setOptions(results);
            } catch (error) {
                console.error(error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchOptions, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [query, onSearch]);

    const handleSelectOption = (option: SearchOption) => {
        setQuery(option.label); // Show selection text in input
        onChange(option.id, option.slug, option.label);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative flex items-center">
                {icon && <span className="absolute right-3 text-muted-foreground">{icon}</span>}
                {!icon && <Search className="absolute right-3 text-muted-foreground" size={16} />}

                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        if (!e.target.value) {
                            onChange('', '', ''); // Reset if cleared
                        }
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full bg-muted/30 border border-border rounded-xl pr-10 pl-10 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                    placeholder={placeholder}
                />

                {loading && (
                    <div className="absolute left-3">
                        <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {isOpen && query.trim().length >= 2 && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {options.length > 0 ? (
                        <ul className="py-1">
                            {options.map((option) => (
                                <li
                                    key={option.id}
                                    onClick={() => handleSelectOption(option)}
                                    className="px-4 py-2 hover:bg-muted cursor-pointer text-sm font-medium transition-colors border-b last:border-0 border-border"
                                >
                                    {option.label}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        !loading && (
                            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                                لا توجد نتائج مطابقة
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
