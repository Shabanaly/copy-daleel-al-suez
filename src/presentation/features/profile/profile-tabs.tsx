import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export type TabItem<T extends string = string> = {
    id: T
    label: string
    icon: LucideIcon
}

interface ProfileTabsProps<T extends string> {
    items: TabItem<T>[]
    activeTab: T
    onTabChange: (tab: T) => void
}

export function ProfileTabs<T extends string>({ items, activeTab, onTabChange }: ProfileTabsProps<T>) {
    return (
        <div className="border-b border-border mb-6 -mx-8 px-8 overflow-x-auto">
            <nav className="flex gap-1 min-w-max">
                {items.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 font-bold text-sm whitespace-nowrap transition-all border-b-2 min-w-fit rounded-t-xl",
                                isActive
                                    ? "text-primary border-primary bg-card shadow-sm"
                                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <Icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </nav>
        </div>
    )
}
