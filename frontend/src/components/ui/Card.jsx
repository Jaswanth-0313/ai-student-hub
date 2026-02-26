import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn("glass-card animate-fade-in", className)}
            {...props}
        >
            {children}
        </div>
    )
}
