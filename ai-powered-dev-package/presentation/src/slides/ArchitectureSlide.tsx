import { motion } from 'framer-motion'
import { useState } from 'react'
import { Boxes, GitBranch, Layers, Zap, Database, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'

const decisions = [
  {
    id: 'separation',
    icon: <GitBranch className="w-5 h-5" />,
    title: 'Times Independentes',
    description: 'Engine e Sales são produtos separados com bases de dados e deployments independentes. Cada time evolui no seu ritmo sem bloquear o outro.',
    benefit: 'Velocidade de desenvolvimento e deploy independente',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
  },
  {
    id: 'contracts',
    icon: <Layers className="w-5 h-5" />,
    title: 'Contratos Públicos',
    description: 'O Motor de Pricing expõe uma interface pública de streaming para qualquer sistema de Sales — interno ou externo. Funciona como caixa-preta.',
    benefit: 'Novos canais sem alterar o motor',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
  },
  {
    id: 'streaming',
    icon: <Radio className="w-5 h-5" />,
    title: 'Streaming como Backbone',
    description: 'Todos os dados de mercado fluem por um barramento de eventos com particionamento por ativo. Cada consumidor é independente e escalável.',
    benefit: 'Replay, multi-consumo, ordenação garantida',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 'caching',
    icon: <Zap className="w-5 h-5" />,
    title: 'Cache em Camadas',
    description: 'Preços são pré-calculados e cacheados em memória. Cotações de clientes são servidas sem round-trip ao motor — latência sub-milissegundo.',
    benefit: '5M clientes podem consultar o mesmo preço = 1 leitura de cache',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
  },
  {
    id: 'sharding',
    icon: <Database className="w-5 h-5" />,
    title: 'Particionamento por Ativo',
    description: 'Arquitetura preparada para sharding horizontal. Cada grupo de ativos pode rodar em uma instância própria do motor de pricing.',
    benefit: 'Escala horizontal sem reescrita',
    color: 'text-trade-positive',
    bgColor: 'bg-trade-positive/10',
  },
]

export function ArchitectureSlide() {
  const [activeDecision, setActiveDecision] = useState<string | null>(null)
  const selected = decisions.find(d => d.id === activeDecision)

  return (
    <div className="slide bg-gradient-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-chart-2/50 to-transparent" />

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(oklch(1 0 0 / 30%) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <Boxes className="w-5 h-5 text-chart-2" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-chart-2">
              Arquitetura
            </span>
          </div>
          <h2 className="text-4xl font-black leading-tight" style={{ fontFamily: 'Itau Display' }}>
            Projetado para escala.
            <br />
            <span className="text-muted-foreground">Construído para evoluir.</span>
          </h2>
        </motion.div>

        <div className="flex gap-6">
          {/* Decision cards */}
          <div className="flex-1 grid grid-cols-1 gap-3">
            {decisions.map((decision, i) => (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                onMouseEnter={() => setActiveDecision(decision.id)}
                onMouseLeave={() => setActiveDecision(null)}
                className={cn(
                  'glass-card p-4 flex items-start gap-4 cursor-default transition-all duration-300',
                  activeDecision === decision.id ? 'border-glow glow-primary' : 'hover:bg-white/3'
                )}
              >
                <div className={cn('p-2 rounded-lg shrink-0', decision.bgColor, decision.color)}>
                  {decision.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-foreground mb-1">{decision.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: 'Itau Text' }}>
                    {decision.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detail panel — fixed height to prevent layout shift */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="w-[300px] flex flex-col"
          >
            <div className="glass-card-strong p-6 border-glow min-h-[320px]">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={cn('p-3 rounded-lg w-fit mb-4', selected.bgColor, selected.color)}>
                    {selected.icon}
                  </div>
                  <h4 className="text-lg font-black text-foreground mb-2">{selected.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed" style={{ fontFamily: 'Itau Text' }}>
                    {selected.description}
                  </p>
                  <div className="p-3 rounded-lg bg-trade-positive/5 border border-trade-positive/15">
                    <span className="text-[10px] text-trade-positive uppercase tracking-wider font-bold">Benefício</span>
                    <p className="text-xs text-foreground mt-1" style={{ fontFamily: 'Itau Text' }}>
                      {selected.benefit}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full py-8">
                  <Boxes className="w-10 h-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Itau Text' }}>
                    Passe o mouse sobre uma decisão para ver detalhes
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
