import { motion } from 'framer-motion'
import {
  Zap,
  LineChart,
  ShieldCheck,
  Radio,
  ArrowRight,
  Sparkles,
  Cpu,
  Globe,
} from 'lucide-react'

const capabilities = [
  {
    icon: <Radio className="w-5 h-5" />,
    title: 'Dados em Tempo Real',
    desc: 'Múltiplas fontes, normalização automática, distribuição instantânea',
  },
  {
    icon: <LineChart className="w-5 h-5" />,
    title: 'Precificação Inteligente',
    desc: 'VWAP multi-camada, spread dinâmico, profundidade de liquidez',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Execução Eletrônica',
    desc: 'Diversos tipos de ordem e capacidade para estratégias automatizadas: arbitragem, cash & carry, fixing e mais',
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Risco em Tempo Real',
    desc: 'Limites matriciais, monitoramento de exposição, P&L contínuo',
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    title: 'Estratégias Plugáveis',
    desc: 'Arquitetura extensível para novas estratégias de trading eletrônico sem reescrever o motor',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'Infraestrutura Portátil',
    desc: 'Opera próxima das exchanges, em qualquer região, escalando horizontalmente sob demanda',
  },
]

export function VisionSlide() {
  return (
    <div className="slide bg-gradient-dark relative overflow-hidden">
      {/* Primary accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Background glow */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[150px]" />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex gap-12">
        {/* Left side — Vision */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-3"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              A Solução
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl font-black mb-4 leading-tight"
            style={{ fontFamily: 'Itau Display' }}
          >
            Uma plataforma.
            <br />
            <span className="text-gradient-primary">Todo o fluxo de trading.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base text-muted-foreground mb-8 leading-relaxed"
            style={{ fontFamily: 'Itau Text' }}
          >
            O SmartTrading integra todo o ciclo de vida de uma operação:
            da captura do dado de mercado até a execução e gestão de risco,
            em uma plataforma moderna, escalável e em tempo real.
            Projetada para absorver o legado gradualmente — sem interromper as operações existentes.
          </motion.p>

          {/* Crypto today → Multi-asset tomorrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card p-4 border-glow inline-flex items-center gap-4"
          >
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Hoje</div>
              <div className="text-sm font-bold text-foreground">Crypto</div>
            </div>
            <ArrowRight className="w-4 h-4 text-primary" />
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Amanhã</div>
              <div className="text-sm font-bold text-foreground">FX · Commodities · Renda Fixa</div>
            </div>
          </motion.div>
        </div>

        {/* Right side — Capabilities */}
        <div className="w-[380px] flex flex-col gap-3">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              className="glass-card p-4 flex items-start gap-3 group hover:border-glow transition-all duration-300 cursor-default"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary/15 transition-colors">
                {cap.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-0.5">{cap.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: 'Itau Text' }}>
                  {cap.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
