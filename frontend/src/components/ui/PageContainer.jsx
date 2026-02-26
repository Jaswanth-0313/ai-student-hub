import React from 'react'
import { cn } from './Card'

export function PageContainer({ className, children, ...props }) {
    return (
        <div
            className={cn("min-h-screen bg-background w-full", className)}
            {...props}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
                {children}
            </div>
        </div>
    )
}
