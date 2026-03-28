import { motion } from 'framer-motion'
import { useState } from 'react'
import { Map, CheckCircle2, Circle, ArrowRight, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'

const phases = [
  {
    id: 'v1',
    name: 'V1 — MVP',
    status: 'done' as const,
    color: 'text-trade-positive',
    bgColor: 'bg-trade-positive/10',
    borderColor: 'border-trade-positive/20',
    period: 'Concluído',
    items: [
      { label: 'Motor de execução com 4 tipos de ordem', done: true },
      { label: 'VWAP + Price Ladder (5 tiers)', done: true },
      { label: 'RFQ completo (request → quote → deal → hedge)', done: true },
      { label: 'Cockpit do trader (7+ painéis)', done: true },
      { label: 'Gestão de risco matricial', done: true },
      { label: 'Distribuição multi-canal (Retail, Corporate, Institutional)', done: true },
      { label: 'Contrato público de streaming (PDS)', done: true },
      { label: '271+ testes unitários', done: true },
    ],
  },
  {
    id: 'v2',
    name: 'V2 — Consolidação',
    status: 'next' as const,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    period: 'Próximo Ciclo',
    items: [
      { label: 'Autenticação e autorização real', done: false },
      { label: 'Histórico próprio de market data', done: false },
      { label: 'Monitoramento avançado de liquidez', done: false },
      { label: 'Verificação real de saldo', done: false },
      { label: 'Backtesting com dados próprios', done: false },
    ],
  },
  {
    id: 'v3',
    name: 'V3 — Escala',
    status: 'future' as const,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    borderColor: 'border-chart-4/20',
    period: 'Visão Futura',
    items: [
      { label: 'Pricing Shards (escala horizontal do motor)', done: false },
      { label: 'Multi-venue (roteamento entre exchanges)', done: false },
      { label: 'Expansão multi-asset (FX, Commodities)', done: false },
      { label: 'APIs públicas para clientes institucionais', done: false },
      { label: 'Cobertura de testes frontend', done: false },
    ],
  },
]

export function RoadmapSlide() {
  const [activePhase, setActivePhase] = useState<string>('v1')
  const selected = phases.find(p => p.id === activePhase)!

  return (
    <div className="slide bg-gradient-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-trade-positive/30 via-50% via-primary/50 to-chart-4/30" />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <Map className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Roadmap
            </span>
          </div>
          <h2 className="text-4xl font-black leading-tight" style={{ fontFamily: 'Itau Display' }}>
            De onde viemos.
            <br />
            <span className="text-muted-foreground">Para onde vamos.</span>
          </h2>
        </motion.div>

        {/* Phase selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center gap-3 mb-8"
        >
          {phases.map((phase, i) => (
            <div key={phase.id} className="flex items-center gap-3">
              <button
                onClick={() => setActivePhase(phase.id)}
                className={cn(
                  'glass-card px-5 py-3 flex items-center gap-3 transition-all duration-300',
                  activePhase === phase.id ? `border ${phase.borderColor} glow-primary` : 'hover:bg-white/5'
                )}
              >
                <div className={cn('p-1.5 rounded-lg', phase.bgColor, phase.color)}>
                  {phase.status === 'done' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : phase.status === 'next' ? (
                    <Rocket className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{phase.name}</div>
                  <div className="text-[10px] text-muted-foreground">{phase.period}</div>
                </div>
              </button>
              {i < phases.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground/30" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Phase detail */}
        <motion.div
          key={activePhase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={cn('glass-card-strong p-8 border', selected.borderColor)}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={cn('p-2.5 rounded-lg', selected.bgColor, selected.color)}>
              {selected.status === 'done' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : selected.status === 'next' ? (
                <Rocket className="w-6 h-6" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground">{selected.name}</h3>
              <span className={cn('text-xs font-semibold', selected.color)}>{selected.period}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {selected.items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/2 hover:bg-white/5 transition-colors"
              >
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-trade-positive shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                )}
                <span className={cn(
                  'text-sm',
                  item.done ? 'text-foreground' : 'text-muted-foreground'
                )} style={{ fontFamily: 'Itau Text' }}>
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
