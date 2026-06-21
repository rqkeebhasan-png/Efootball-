import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'emerald' | 'gold' | 'none'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, glow = 'none', padding = 'md', className = '', ...props }: CardProps) {
  const glowMap = {
    none: '',
    emerald: 'shadow-glow-emerald border-emerald-500/20',
    gold: 'shadow-glow-gold border-gold-500/20',
  }
  const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={`bg-card-gradient border border-slate-700/50 rounded-xl shadow-card ${glowMap[glow]} ${paddingMap[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>
}
