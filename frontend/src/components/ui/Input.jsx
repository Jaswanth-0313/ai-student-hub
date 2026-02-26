import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from './Card'

export function Input({ className, type, error, ...props }) {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'

    return (
        <div className="relative w-full">
            <input
                type={isPassword ? (showPassword ? 'text' : 'password') : type}
                className={cn(
                    "flex h-12 w-full rounded-xl border bg-surface/50 px-4 py-2 text-sm text-text ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                    error
                        ? "border-red-500/50 focus-visible:ring-red-500/50"
                        : "border-white/10 focus-visible:ring-primary focus-visible:border-primary",
                    className
                )}
                {...props}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            )}
            {error && (
                <p className="mt-1 text-xs text-red-400 animate-fade-in">{error}</p>
            )}
        </div>
    )
}
