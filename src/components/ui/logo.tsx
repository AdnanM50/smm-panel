import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Icon - NION style */}
      <div className={cn(
        "rounded-xl bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25",
        sizeClasses[size]
      )}>
        <span className="text-white font-extrabold tracking-tight text-lg">S</span>
      </div>
      
      {/* Text */}
      {showText && (
        <span className={cn(
          "font-bold text-white tracking-tight",
          textSizeClasses[size]
        )}>
          Panel
        </span>
      )}
    </div>
  )
}

// Alternative logo with different styling
export function LogoAlt({ className, size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Icon with more modern styling */}
      <div className={cn(
        "rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/25",
        sizeClasses[size]
      )}>
        <span className="text-white font-black text-lg drop-shadow-sm">S</span>
      </div>
      
      {/* Text with gradient */}
      {showText && (
        <span className={cn(
          "font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 tracking-tight",
          textSizeClasses[size]
        )}>
          BEST SMM
        </span>
      )}
    </div>
  )
}

// Minimal icon-only version
export function LogoIcon({ className, size = 'md' }: Omit<LogoProps, 'showText'>) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  return (
    <div className={cn(
      "rounded-xl bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300",
      sizeClasses[size],
      className
    )}>
      <span className="text-white font-extrabold tracking-tight text-lg">N</span>
    </div>
  )
}
