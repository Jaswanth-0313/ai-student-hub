import React from 'react'
import { cn } from './Card'

export function SectionTitle({ className, title, subtitle, ...props }) {
    return (
        <div className={cn("mb-8 space-y-1", className)} {...props}>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {title}
            </h2>
            {subtitle && (
                <p className="text-lg text-gray-400">
                    {subtitle}
                </p>
            )}
        </div>
    )
}
