import { motion } from 'framer-motion'
import { useState } from 'react'
import { Zap, CheckCircle, ShieldCheck, Send, BarChart3, Target, Cpu, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const lifecycleSteps = [
  { icon: <Send className="w-5 h-5" />, label: 'Entrada', sublabel: 'Validação e normalização', color: 'text-chart-2' },
  { icon: <ShieldCheck className="w-5 h-5" />, label: 'Risco', sublabel: 'Limites em tempo real', color: 'text-chart-3' },
  { icon: <Zap className="w-5 h-5" />, label: 'Execução', sublabel: 'Roteamento inteligente', color: 'text-primary' },
  { icon: <BarChart3 className="w-5 h-5" />, label: 'Fill', sublabel: 'Parcial ou total', color: 'text-chart-4' },
  { icon: <CheckCircle className="w-5 h-5" />, label: 'Confirmação', sublabel: 'Posição e P&L atualizados', color: 'text-trade-positive' },
]

const strategyCapabilities = [
  {
    icon: <Target className="w-5 h-5" />,
    title: 'Liquidez & Market Making',
    desc: 'O motor gerencia posição, exposição e hedging automaticamente quando provê liquidez para clientes.',
    detail: 'Netting de posição, P&L contínuo, limites por ativo',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'Estratégias Algorítmicas',
    desc: 'Capacidade de executar ordens fragmentadas ao longo do tempo para minimizar impacto de mercado.',
    detail: 'TWAP, BBO e framework extensível para novas estratégias',
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    title: 'Arquitetura de Estratégias',
    desc: 'Framework plugável onde novas estratégias de trading eletrônico são implementadas sem alterar o motor central.',
    detail: 'Arbitragem, cash & carry, fixing, eventos, leilão',
  },
]

const riskDimensions = [
  { label: 'Por Ativo', value: 'Max notional por instrumento', utilization: 65 },
  { label: 'Por Trader', value: 'Limite individual de exposição', utilization: 42 },
  { label: 'Por Venue', value: 'Concentração por exchange', utilization: 28 },
  { label: 'P&L Diário', value: 'Stop loss automático', utilization: 15 },
]

export function ExecutionSlide() {
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [activeStrategy, setActiveStrategy] = useState<number>(0)

  return (
    <div className="slide bg-gradient-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-chart-3/50 to-transparent" />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-chart-3" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-chart-3">
              Execução & Estratégias
            </span>
          </div>
          <h2 className="text-4xl font-black leading-tight" style={{ fontFamily: 'Itau Display' }}>
            Da decisão à execução
            <br />
            <span className="text-muted-foreground">sem fricção.</span>
          </h2>
        </motion.div>

        {/* Lifecycle flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <div className="glass-card-strong p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Ciclo de Vida da Ordem
            </h3>
            <div className="flex items-center justify-between">
              {lifecycleSteps.map((step, i) => (
                <div key={step.label} className="flex items-center flex-1">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    onMouseEnter={() => setActiveStep(i)}
                    onMouseLeave={() => setActiveStep(null)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 cursor-default flex-1',
                      activeStep === i ? 'bg-white/5 glow-primary' : ''
                    )}
                  >
                    <div className={cn('p-2.5 rounded-lg bg-white/5', step.color)}>
                      {step.icon}
                    </div>
                    <span className="text-sm font-bold text-foreground">{step.label}</span>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight" style={{ fontFamily: 'Itau Text' }}>
                      {step.sublabel}
                    </span>
                  </motion.div>

                  {i < lifecycleSteps.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                      className="w-full h-[2px] bg-gradient-to-r from-white/10 to-white/10 mx-1"
                      style={{ maxWidth: '40px' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Strategies + Risk */}
        <div className="flex gap-6">
          {/* Strategy capabilities */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex-1 flex flex-col gap-3"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Capacidades de Execução
            </h3>
            {strategyCapabilities.map((strategy, i) => (
              <motion.div
                key={strategy.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
                onMouseEnter={() => setActiveStrategy(i)}
                className={cn(
                  'glass-card p-4 flex items-start gap-4 cursor-default transition-all duration-300',
                  activeStrategy === i ? 'border-glow glow-primary' : 'hover:bg-white/3'
                )}
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  {strategy.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-1">{strategy.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-1.5" style={{ fontFamily: 'Itau Text' }}>
                    {strategy.desc}
                  </p>
                  {activeStrategy === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-[10px] text-primary/80 italic"
                    >
                      {strategy.detail}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Risk Engine */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="w-[320px]"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Motor de Risco em Tempo Real
            </h3>
            <div className="glass-card-strong p-5 border border-chart-3/20">
              <ShieldCheck className="w-7 h-7 text-chart-3 mb-3" />
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed" style={{ fontFamily: 'Itau Text' }}>
                Cada ordem e posição é validada em tempo real contra uma matriz de limites configuráveis.
              </p>
              <div className="flex flex-col gap-3">
                {riskDimensions.map((dim, i) => (
                  <motion.div
                    key={dim.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.08 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{dim.label}</span>
                      <span className="text-[10px] text-muted-foreground">{dim.utilization}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${dim.utilization}%` }}
                        transition={{ duration: 0.8, delay: 1.1 + i * 0.08 }}
                        className={cn(
                          'h-full rounded-full',
                          dim.utilization > 80 ? 'bg-trade-negative' :
                            dim.utilization > 50 ? 'bg-yellow-500' : 'bg-trade-positive'
                        )}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{dim.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
