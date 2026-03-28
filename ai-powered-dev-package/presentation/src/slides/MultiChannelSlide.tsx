import { motion } from 'framer-motion'
import { useState } from 'react'
import { Network, Users, Building2, Globe, ArrowRight, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

const channels = [
  {
    id: 'retail',
    icon: <Globe className="w-6 h-6" />,
    name: 'Retail',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    borderColor: 'border-chart-2/30',
    spread: '10 bps',
    description: 'Clientes pessoa física acessando via plataforma web. Experiência simplificada com RFQ.',
    features: ['RFQ simplificado', 'Preço único (bid ou ask)', 'Countdown de validade', 'Histórico de deals'],
    flow: 'Seleciona ativo → Escolhe lado → Define quantidade → Recebe cotação → Aceita ou rejeita',
  },
  {
    id: 'corporate',
    icon: <Building2 className="w-6 h-6" />,
    name: 'Corporate',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    borderColor: 'border-chart-3/30',
    spread: '5 bps',
    description: 'Empresas com necessidade de hedge ou operações de câmbio cripto. Spread preferencial.',
    features: ['Spread reduzido', 'Volumes maiores', 'Atendimento dedicado', 'Relatórios customizados'],
    flow: 'Contato via Sales → Cotação personalizada → Negociação → Confirmação bilateral',
  },
  {
    id: 'institutional',
    icon: <Users className="w-6 h-6" />,
    name: 'Institutional',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    borderColor: 'border-chart-4/30',
    spread: '3 bps',
    description: 'Fundos e gestoras com alto volume. Acesso via API ou mesa de vendas dedicada.',
    features: ['Spread mínimo', 'API dedicada', 'Co-location', 'SLA de latência'],
    flow: 'API de streaming → Preço contínuo → Execução imediata → Settlement D+0',
  },
]

export function MultiChannelSlide() {
  const [activeChannel, setActiveChannel] = useState<string>('retail')
  const selected = channels.find(c => c.id === activeChannel)!

  return (
    <div className="slide bg-gradient-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-chart-4/50 to-transparent" />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <Network className="w-5 h-5 text-chart-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-chart-4">
              Distribuição Multi-Canal
            </span>
          </div>
          <h2 className="text-4xl font-black leading-tight" style={{ fontFamily: 'Itau Display' }}>
            Um motor de liquidez.
            <br />
            <span className="text-muted-foreground">Múltiplos canais de distribuição.</span>
          </h2>
        </motion.div>

        {/* Architecture diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          {/* Engine */}
          <div className="glass-card-strong p-4 border-glow glow-primary text-center">
            <div className="text-primary text-xs font-bold uppercase tracking-wider mb-1">Motor de Pricing</div>
            <div className="text-[10px] text-muted-foreground">Price Ladder + VWAP + Spread</div>
          </div>

          <ArrowRight className="w-5 h-5 text-primary/40" />

          {/* Sales Layer */}
          <div className="glass-card p-4 text-center">
            <div className="text-foreground text-xs font-bold uppercase tracking-wider mb-1">Camada Sales</div>
            <div className="text-[10px] text-muted-foreground">Spread por canal + Interpolação</div>
          </div>

          <ArrowRight className="w-5 h-5 text-primary/40" />

          {/* Channels */}
          <div className="flex flex-col gap-2">
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={cn(
                  'glass-card px-3 py-1.5 flex items-center gap-2 transition-all duration-300 text-left',
                  activeChannel === ch.id ? `${ch.borderColor} border glow-primary` : 'hover:bg-white/3'
                )}
              >
                <div className={cn(ch.color)}>{ch.icon}</div>
                <span className="text-xs font-bold text-foreground">{ch.name}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{ch.spread}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Channel detail */}
        <motion.div
          key={activeChannel}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex gap-6"
        >
          {/* Description */}
          <div className={cn('flex-1 glass-card-strong p-6 border', selected.borderColor)}>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('p-2.5 rounded-lg', selected.bgColor, selected.color)}>
                {selected.icon}
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">{selected.name}</h3>
                <span className="text-xs text-muted-foreground">Spread: {selected.spread}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed" style={{ fontFamily: 'Itau Text' }}>
              {selected.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {selected.features.map(f => (
                <span key={f} className={cn(
                  'text-[10px] px-2.5 py-1 rounded-full font-medium',
                  selected.bgColor, selected.color
                )}>
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Flow + Security */}
          <div className="w-[320px] flex flex-col gap-4">
            <div className="glass-card p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Fluxo do Cliente
              </h4>
              <div className="flex flex-col gap-2">
                {selected.flow.split(' → ').map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold',
                      selected.bgColor, selected.color
                    )}>
                      {i + 1}
                    </div>
                    <span className="text-xs text-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                <Lock className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Segurança da Informação</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: 'Itau Text' }}>
                O cliente vê apenas o preço final, quantidade e instrumento.
                Spreads internos, preço da mesa e detalhes de hedge são invisíveis.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
