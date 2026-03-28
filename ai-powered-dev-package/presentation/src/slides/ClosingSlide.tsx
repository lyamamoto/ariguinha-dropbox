import { motion } from 'framer-motion'
import { TrendingUp, CheckCircle2 } from 'lucide-react'

const valueProps = [
  'Plataforma end-to-end: do dado de mercado à execução de estratégias de trading eletrônico',
  'Precificação inteligente com profundidade por camada e escalabilidade para milhões de cotações',
  'Motor de risco em tempo real com limites matriciais e monitoramento de exposição',
  'Capacidade de prover liquidez para múltiplos canais e casos de uso de negócio',
  'Arquitetura preparada para escala horizontal e expansão multi-asset',
]

export function ClosingSlide() {
  return (
    <div className="slide bg-gradient-radial relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.02] animate-grid-flow"
        style={{
          backgroundImage: `linear-gradient(oklch(1 0 0 / 20%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 20%) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center gap-8 max-w-3xl mx-auto text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary-strong"
        >
          <TrendingUp className="w-8 h-8 text-primary" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl font-black leading-tight"
          style={{ fontFamily: 'Itau Display' }}
        >
          <span className="text-gradient-primary">Smart</span>
          <span className="text-foreground">Trading</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg text-muted-foreground"
          style={{ fontFamily: 'Itau Text' }}
        >
          Modernizando a operação de trading para o futuro.
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-20 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
        />

        {/* Value props */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass-card-strong p-6 w-full text-left"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 text-center">
            O que entregamos
          </h3>
          <div className="flex flex-col gap-3">
            {valueProps.map((prop, i) => (
              <motion.div
                key={prop}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-trade-positive shrink-0 mt-0.5" />
                <span className="text-sm text-foreground" style={{ fontFamily: 'Itau Text' }}>
                  {prop}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="mt-8 flex items-center gap-2 text-muted-foreground/40"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary/60" />
          </div>
          <span className="text-xs uppercase tracking-[0.2em]">Itaú SmartTrading — 2026</span>
        </motion.div>
      </div>
    </div>
  )
}
