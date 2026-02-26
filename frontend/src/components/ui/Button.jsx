import React from 'react'
import { cn } from './Card'

export function Button({ className, variant = 'primary', size = 'default', children, ...props }) {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"

    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]",
        secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]",
        outline: "border border-white/20 bg-transparent hover:bg-white/5 text-text",
        ghost: "bg-transparent hover:bg-white/10 text-text",
        danger: "bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50"
    }

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-2xl px-8 text-lg",
        icon: "h-10 w-10"
    }

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    )
}
