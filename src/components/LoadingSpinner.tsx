'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'secondary'
  text?: string
  showIcon?: boolean
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  text,
  showIcon = false,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const variantClasses = {
    default: 'border-gray-300 border-t-blue-500',
    primary: 'border-blue-200 border-t-blue-500',
    secondary: 'border-purple-200 border-t-purple-500'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        {showIcon ? (
          <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6'} text-white`} />
          </div>
        ) : (
          <div className={`w-full h-full rounded-full border-2 ${variantClasses[variant]} animate-spin`} />
        )}
      </motion.div>
      
      {text && (
        <motion.p
          className={`text-gray-600 font-medium mt-2 ${textSizes[size]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

// Full screen loading component
export function FullScreenLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <LoadingSpinner size="lg" variant="primary" text={text} />
    </div>
  )
}

// Page loading component
export function PageLoader({ text = "Loading page..." }: { text?: string }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <LoadingSpinner size="md" variant="primary" text={text} />
    </div>
  )
}

// Inline loading component
export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size="sm" variant="primary" />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  )
}
