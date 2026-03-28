import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

export function CoverSlide() {
  return (
    <div className="slide bg-gradient-radial relative overflow-hidden">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-[0.03] animate-grid-flow"
        style={{
          backgroundImage: `linear-gradient(oklch(1 0 0 / 20%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 20%) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8">
        {/* Logo + badge */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm font-medium text-primary uppercase tracking-[0.3em]">
            Itaú Unibanco
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-7xl font-black text-center leading-tight"
          style={{ fontFamily: 'Itau Display' }}
        >
          <span className="text-gradient-primary">Smart</span>
          <span className="text-foreground">Trading</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-xl text-muted-foreground text-center max-w-2xl leading-relaxed"
          style={{ fontFamily: 'Itau Text' }}
        >
          Plataforma de Trading de Nova Geração
          <br />
          <span className="text-foreground/80">Do dado de mercado à execução, em tempo real.</span>
        </motion.p>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="w-24 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
        />

        {/* Tagline cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex items-center gap-6 mt-2"
        >
          {[
            { label: 'Tempo Real', icon: '⚡' },
            { label: 'Multi-Canal', icon: '🔄' },
            { label: 'Escala', icon: '📈' },
          ].map((item) => (
            <div
              key={item.label}
              className="glass-card px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Navigate hint */}
        {/*<motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2 }}
          className="absolute bottom-24 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground/50">
            Use as setas para navegar
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-muted-foreground/30 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-muted-foreground/50" />
          </motion.div>
        </motion.div>*/}
      </div>
    </div>
  )
}
