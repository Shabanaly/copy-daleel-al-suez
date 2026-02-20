export interface Setting {
    key: string
    value: string
    group: 'general' | 'contact' | 'menus' | 'system' | 'appearance'
    type: 'text' | 'boolean' | 'json' | 'image'
    label: string
    description?: string
    isPublic: boolean
    updatedAt: Date
}
