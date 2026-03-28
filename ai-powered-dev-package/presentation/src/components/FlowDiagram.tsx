import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FlowNodeProps {
  icon: ReactNode
  label: string
  sublabel?: string
  delay?: number
  variant?: 'default' | 'primary' | 'success' | 'muted'
  size?: 'sm' | 'md' | 'lg'
}

export function FlowNode({ icon, label, sublabel, delay = 0, variant = 'default', size = 'md' }: FlowNodeProps) {
  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-5 py-3',
    lg: 'px-6 py-4',
  }

  const variantClasses = {
    default: 'glass-card',
    primary: 'glass-card border-glow glow-primary',
    success: 'glass-card border border-trade-positive/30',
    muted: 'glass-card opacity-70',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'flex flex-col items-center gap-1.5 text-center',
        sizeClasses[size],
        variantClasses[variant],
      )}
    >
      <div className="text-primary">{icon}</div>
      <span className="text-sm font-bold text-foreground">{label}</span>
      {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
    </motion.div>
  )
}

interface FlowArrowProps {
  delay?: number
  direction?: 'right' | 'down'
  label?: string
}

export function FlowArrow({ delay = 0, direction = 'right', label }: FlowArrowProps) {
  const isRight = direction === 'right'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        'flex items-center justify-center',
        isRight ? 'flex-row' : 'flex-col'
      )}
    >
      {label && (
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</span>
      )}
      <div className={cn(
        'bg-primary/40',
        isRight ? 'w-8 h-[2px]' : 'w-[2px] h-8'
      )} />
      <div
        className={cn(
          'w-0 h-0 border-primary/40',
          isRight
            ? 'border-l-[6px] border-y-[4px] border-y-transparent border-l-primary/40'
            : 'border-t-[6px] border-x-[4px] border-x-transparent border-t-primary/40'
        )}
      />
    </motion.div>
  )
}
