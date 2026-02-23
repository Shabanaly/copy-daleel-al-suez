'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea';
    required?: boolean;
    options?: (string | { label: string; value: string })[]; // Support both strings and objects
    placeholder?: string;
}

interface DynamicFormBuilderProps {
    fields: FormField[];
    onChange: (attributes: Record<string, any>) => void;
    initialValues?: Record<string, any>;
}

export function DynamicFormBuilder({ fields, onChange, initialValues = {} }: DynamicFormBuilderProps) {
    const [values, setValues] = useState<Record<string, any>>(initialValues);

    // Only broadcast changes to parent. We don't want to re-init values if initialValues changes 
    // unless it's a completely different record (handled by 'key' prop in parent)
    useEffect(() => {
        onChange(values);
    }, [values]); // Removed onChange to avoid unnecessary cycles if parent doesn't memoize it

    const handleChange = (name: string, value: any) => {
        setValues(prev => {
            if (prev[name] === value) return prev;
            return { ...prev, [name]: value };
        });
    };

    if (!fields || fields.length === 0) return null;

    return (
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-4">
            <h3 className="text-lg font-bold mb-4 text-foreground">تفاصيل إضافية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => (
                    <div key={field.name} className={cn("flex flex-col gap-1", field.type === 'textarea' && "md:col-span-2")}>
                        <label className="text-sm font-medium text-foreground">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === 'select' ? (
                            <div className="space-y-3">
                                <select
                                    required={field.required}
                                    value={values[field.name] || ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none bg-muted text-foreground"
                                >
                                    <option value="">اختر {field.label}</option>
                                    {field.options?.map((opt) => {
                                        const label = typeof opt === 'string' ? opt : opt.label;
                                        const value = typeof opt === 'string' ? opt : opt.value;
                                        return <option key={value} value={value}>{label}</option>
                                    })}
                                </select>

                                {values[field.name] === 'other' && ( // 'other' is standardized value
                                    <input
                                        type="text"
                                        placeholder={`اكتب ${field.label} هنا...`}
                                        value={values[`${field.name}_custom`] || ''}
                                        onChange={(e) => handleChange(`${field.name}_custom`, e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-primary/30 focus:border-primary outline-none bg-primary/5 text-foreground animate-in fade-in slide-in-from-top-1"
                                    />
                                )}
                            </div>
                        ) : field.type === 'textarea' ? (
                            <textarea
                                required={field.required}
                                rows={3}
                                value={values[field.name] || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none bg-muted text-foreground"
                                placeholder={field.placeholder || `أدخل ${field.label}`}
                            />
                        ) : field.type === 'checkbox' ? (
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    checked={values[field.name] || false}
                                    onChange={(e) => handleChange(field.name, e.target.checked)}
                                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                                />
                                <span className="text-sm text-muted-foreground">{field.label}</span>
                            </div>
                        ) : (
                            <input
                                type={field.type}
                                required={field.required}
                                value={values[field.name] || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none bg-muted text-foreground"
                                placeholder={field.placeholder || `أدخل ${field.label}`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
