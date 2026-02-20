"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-9 h-9">
                <span className="sr-only">Toggle theme</span>
            </button>
        )
    }

    return (
        <button
            onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
            className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative w-9 h-9 flex items-center justify-center cursor-pointer"
            aria-label="Toggle theme"
        >
            <Sun className={`h-5 w-5 transition-all absolute text-primary ${resolvedTheme === 'dark' ? '-rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
            <Moon className={`h-5 w-5 transition-all absolute text-primary-400 ${resolvedTheme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
