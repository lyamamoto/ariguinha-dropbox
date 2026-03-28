import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { DollarSign, ArrowDown, ArrowUp, Layers, Users, ToggleRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const ladderTiers = [
  { tier: 1, maxQty: 0.5, ask: 45004.50, bid: 44995.50 },
  { tier: 2, maxQty: 2.0, ask: 45013.50, bid: 44986.50 },
  { tier: 3, maxQty: 10.0, ask: 45045.00, bid: 44955.00 },
  { tier: 4, maxQty: 50.0, ask: 45135.00, bid: 44865.00 },
  { tier: 5, maxQty: 200.0, ask: 45360.00, bid: 44640.00 },
]

const mid = 45000.00

function interpolatePrice(qty: number, side: 'ask' | 'bid'): number {
  if (qty <= ladderTiers[0].maxQty) return ladderTiers[0][side]
  for (let i = 1; i < ladderTiers.length; i++) {
    if (qty <= ladderTiers[i].maxQty) {
      const prev = ladderTiers[i - 1]
      const curr = ladderTiers[i]
      const ratio = (qty - prev.maxQty) / (curr.maxQty - prev.maxQty)
      return prev[side] + ratio * (curr[side] - prev[side])
    }
  }
  return ladderTiers[ladderTiers.length - 1][side]
}

function calcSpread(price: number): string {
  return ((Math.abs(price - mid) / mid) * 100).toFixed(3)
}

const spreadLayers = [
  { label: 'VWAP de Mercado', color: 'text-chart-2', desc: 'Preço médio ponderado por volume do order book' },
  { label: 'Desk Spread', color: 'text-primary', desc: 'Base + impacto por tamanho + skew direcional' },
  { label: 'Sales Spread', color: 'text-chart-3', desc: 'Margem do canal de distribuição' },
]

const channels = [
  { name: 'Retail', spread: 10, color: 'text-chart-2', desc: 'Alto volume, spread maior' },
  { name: 'Corporate', spread: 5, color: 'text-chart-3', desc: 'Volume médio, spread preferencial' },
  { name: 'Institutional', spread: 3, color: 'text-chart-4', desc: 'Pode usar cotação direta (first-class)' },
]

export function PricingSlide() {
  const [qty, setQty] = useState(5.0)
  const [hoveredTier, setHoveredTier] = useState<number | null>(null)
  const [mode, setMode] = useState<'ladder' | 'firstclass'>('ladder')

  const interpolated = useMemo(() => ({
    ask: interpolatePrice(qty, 'ask'),
    bid: interpolatePrice(qty, 'bid'),
  }), [qty])

  const activeTier = useMemo(() => {
    for (let i = 0; i < ladderTiers.length; i++) {
      if (qty <= ladderTiers[i].maxQty) return i
    }
    return ladderTiers.length - 1
  }, [qty])

  return (
    <div className="slide bg-gradient-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Precificação & Distribuição
            </span>
          </div>
          <h2 className="text-4xl font-black leading-tight" style={{ fontFamily: 'Itau Display' }}>
            Escala com inteligência.
            <br />
            <span className="text-muted-foreground">Preço certo para cada cliente.</span>
          </h2>
        </motion.div>

        <div className="flex gap-6">
          {/* Left — Ladder + Interactive Input */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-1 flex flex-col gap-4"
          >
            {/* Mode toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMode('ladder')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all',
                  mode === 'ladder' ? 'bg-primary/15 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Layers className="w-3 h-3 inline mr-1.5" />
                Escada de Preços
              </button>
              <button
                onClick={() => setMode('firstclass')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all',
                  mode === 'firstclass' ? 'bg-chart-4/15 text-chart-4 border border-chart-4/30' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <ToggleRight className="w-3 h-3 inline mr-1.5" />
                Cotação Direta
              </button>
            </div>

            {mode === 'ladder' ? (
              <>
                {/* Price Ladder */}
                <div className="glass-card-strong p-5 glow-primary">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price Ladder — BTC/USDT</h3>
                    <span className="text-[10px] text-primary font-semibold">Pré-calculado · Milhões de consultas/s</span>
                  </div>

                  {/* Header row */}
                  <div className="grid grid-cols-5 gap-2 mb-1.5 px-3">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Tier</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Até</span>
                    <span className="text-[10px] text-trade-positive uppercase tracking-wider text-right">Bid</span>
                    <span className="text-[10px] text-trade-negative uppercase tracking-wider text-right">Ask</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider text-right">Spread</span>
                  </div>

                  {ladderTiers.map((tier, i) => (
                    <motion.div
                      key={tier.tier}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
                      onMouseEnter={() => setHoveredTier(tier.tier)}
                      onMouseLeave={() => setHoveredTier(null)}
                      className={cn(
                        'grid grid-cols-5 gap-2 px-3 py-2 rounded-lg transition-all duration-200 cursor-default',
                        hoveredTier === tier.tier ? 'bg-primary/10 border-glow' :
                          activeTier === i ? 'bg-white/3' : 'hover:bg-white/2'
                      )}
                    >
                      <span className="text-sm font-bold text-foreground">T{tier.tier}</span>
                      <span className="text-sm text-muted-foreground tabular-nums">{tier.maxQty} BTC</span>
                      <span className="text-sm font-semibold text-trade-positive text-right tabular-nums flex items-center justify-end gap-1">
                        <ArrowUp className="w-3 h-3" />
                        {tier.bid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-sm font-semibold text-trade-negative text-right tabular-nums flex items-center justify-end gap-1">
                        <ArrowDown className="w-3 h-3" />
                        {tier.ask.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-sm text-muted-foreground text-right tabular-nums">{calcSpread(tier.ask)}%</span>
                    </motion.div>
                  ))}
                </div>

                {/* Interactive quantity input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="glass-card p-5 border-glow"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Simulador de Interpolação
                  </h4>
                  <div className="flex items-center gap-4 mb-4">
                    <label className="text-sm text-foreground font-semibold shrink-0">Quantidade:</label>
                    <input
                      type="range"
                      min={0.1}
                      max={200}
                      step={0.1}
                      value={qty}
                      onChange={(e) => setQty(parseFloat(e.target.value))}
                      className="flex-1 accent-primary h-1.5 bg-muted rounded-full cursor-pointer"
                    />
                    <span className="text-sm font-bold text-primary tabular-nums w-24 text-right">
                      {qty.toFixed(1)} BTC
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-trade-positive/5 border border-trade-positive/15">
                      <div className="text-[10px] text-trade-positive uppercase tracking-wider font-bold mb-1">Bid (Compra)</div>
                      <div className="text-lg font-black text-trade-positive tabular-nums">
                        {interpolated.bid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-muted-foreground">spread: {calcSpread(interpolated.bid)}%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-trade-negative/5 border border-trade-negative/15">
                      <div className="text-[10px] text-trade-negative uppercase tracking-wider font-bold mb-1">Ask (Venda)</div>
                      <div className="text-lg font-black text-trade-negative tabular-nums">
                        {interpolated.ask.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-muted-foreground">spread: {calcSpread(interpolated.ask)}%</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-3" style={{ fontFamily: 'Itau Text' }}>
                    Arraste o slider para ver a interpolação entre tiers — o preço ajusta automaticamente pela profundidade
                  </p>
                </motion.div>
              </>
            ) : (
              /* First-class mode */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card-strong p-6 flex-1"
              >
                <h3 className="text-base font-black text-foreground mb-3">Cotação Direta (First-Class)</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed" style={{ fontFamily: 'Itau Text' }}>
                  Para canais de menor escala — como clientes institucionais e corporativos — o motor calcula
                  um preço sob demanda, preciso para a quantidade exata solicitada, consultando o order book em tempo real.
                </p>
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/3">
                    <div className="w-6 h-6 rounded-full bg-chart-4/10 text-chart-4 flex items-center justify-center text-xs font-bold">1</div>
                    <span className="text-sm text-foreground">Cliente solicita cotação para quantidade específica</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/3">
                    <div className="w-6 h-6 rounded-full bg-chart-4/10 text-chart-4 flex items-center justify-center text-xs font-bold">2</div>
                    <span className="text-sm text-foreground">Motor calcula VWAP exato + aplica desk spread</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/3">
                    <div className="w-6 h-6 rounded-full bg-chart-4/10 text-chart-4 flex items-center justify-center text-xs font-bold">3</div>
                    <span className="text-sm text-foreground">Preço firme retornado com TTL de validade</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-chart-4/5 border border-chart-4/15">
                  <p className="text-xs text-foreground" style={{ fontFamily: 'Itau Text' }}>
                    <span className="font-bold text-chart-4">Trade-off:</span> Maior precisão por cotação, mas não escala
                    para milhares de clientes simultâneos. Ideal para poucos clientes com grandes volumes.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right — Spread flow + Channels */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-[320px] flex flex-col gap-4"
          >
            {/* Spread decomposition */}
            <div className="glass-card p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Composição do Preço
              </h4>
              <div className="flex flex-col gap-3">
                {spreadLayers.map((layer, i) => (
                  <motion.div
                    key={layer.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', layer.color.replace('text-', 'bg-'))} />
                    <div>
                      <span className={cn('text-sm font-bold', layer.color)}>{layer.label}</span>
                      <p className="text-[10px] text-muted-foreground" style={{ fontFamily: 'Itau Text' }}>
                        {layer.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-center text-foreground font-semibold">
                  <span className="text-chart-2">VWAP</span>
                  {' + '}
                  <span className="text-primary">Desk</span>
                  {' + '}
                  <span className="text-chart-3">Sales</span>
                  {' = '}
                  <span className="text-foreground">Preço do Cliente</span>
                </p>
              </div>
            </div>

            {/* Channel spread */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Spread por Canal
                </h4>
              </div>
              <div className="flex flex-col gap-2">
                {channels.map((ch) => (
                  <div key={ch.name} className="flex items-center justify-between p-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                    <div>
                      <span className={cn('text-sm font-bold', ch.color)}>{ch.name}</span>
                      <p className="text-[10px] text-muted-foreground">{ch.desc}</p>
                    </div>
                    <span className="text-sm font-mono text-primary font-bold">{ch.spread} bps</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scale advantage */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="glass-card p-4 border border-trade-positive/15"
            >
              <p className="text-xs text-foreground leading-relaxed" style={{ fontFamily: 'Itau Text' }}>
                <span className="font-bold text-trade-positive">Vantagem da escada:</span> preços
                pré-calculados em cache permitem servir milhões de cotações simultâneas
                sem sobrecarregar o motor de pricing.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
