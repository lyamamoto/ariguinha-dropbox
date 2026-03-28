import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Monitor,
  Eye,
  BookOpen,
  CandlestickChart,
  Send,
  BarChart3,
  ShieldCheck,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const panels = [
  {
    id: 'watchlist',
    icon: <Eye className="w-4 h-4" />,
    name: 'Watchlist',
    description: 'Lista de ativos com preços em tempo real. Drag-and-drop para reorganizar, troca de feed com um clique.',
    position: 'Esquerda superior',
    features: ['Preços live', 'Multi-feed', 'Drag & Drop', 'Persistência'],
  },
  {
    id: 'orderbook',
    icon: <BookOpen className="w-4 h-4" />,
    name: 'Order Book',
    description: 'Profundidade de mercado Level 2. Visualização de bid/ask com spread em tempo real.',
    position: 'Esquerda inferior',
    features: ['L2 Depth', 'Spread live', 'Color coding'],
  },
  {
    id: 'chart',
    icon: <CandlestickChart className="w-4 h-4" />,
    name: 'Gráfico OHLCV',
    description: 'Candlestick profissional com 6 timeframes. Volume overlay, zoom e pan.',
    position: 'Centro',
    features: ['6 timeframes', 'Volume', 'Streaming live', 'Histórico'],
  },
  {
    id: 'ticket',
    icon: <Send className="w-4 h-4" />,
    name: 'Order Ticket',
    description: 'Entrada rápida de ordens com validação de lot size e tick size. 4 tipos de ordem.',
    position: 'Direita superior',
    features: ['Market/Limit', 'BBO/TWAP', 'Validação live'],
  },
  {
    id: 'blotter',
    icon: <BarChart3 className="w-4 h-4" />,
    name: 'Position Blotter',
    description: 'Posições agregadas com P&L em tempo real. Derivação FIFO de preço médio.',
    position: 'Inferior',
    features: ['P&L live', 'FIFO pricing', 'Unrealized PnL'],
  },
  {
    id: 'risk',
    icon: <ShieldCheck className="w-4 h-4" />,
    name: 'Risk Bar',
    description: 'Utilização de limites com color coding: verde, amarelo, vermelho por dimensão.',
    position: 'Barra superior',
    features: ['Color coded', 'Por ativo', 'Alertas visuais'],
  },
  {
    id: 'alerts',
    icon: <Bell className="w-4 h-4" />,
    name: 'Alertas',
    description: 'Notificações configuráveis por preço e P&L com toast overlay e alerta sonoro.',
    position: 'Overlay',
    features: ['Preço', 'P&L', 'Toast + Som'],
  },
]

export function CockpitSlide() {
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const selectedPanel = panels.find(p => p.id === activePanel)

  return (
    <div className="slide bg-gradient-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <Monitor className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Cockpit do Trader
            </span>
          </div>
          <h2 className="text-4xl font-black leading-tight" style={{ fontFamily: 'Itau Display' }}>
            Tudo que o trader precisa.
            <br />
            <span className="text-muted-foreground">Em uma única tela.</span>
          </h2>
        </motion.div>

        <div className="flex gap-6">
          {/* Mockup layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1"
          >
            <div className="glass-card-strong p-4 glow-primary">
              {/* Mockup grid */}
              <div className="grid grid-cols-4 grid-rows-3 gap-2 aspect-[16/10]">
                {/* Risk Bar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onMouseEnter={() => setActivePanel('risk')}
                  onMouseLeave={() => setActivePanel(null)}
                  className={cn(
                    'col-span-4 rounded-lg p-2 flex items-center justify-between transition-all duration-300 cursor-pointer',
                    activePanel === 'risk' ? 'bg-primary/15 border border-primary/30' : 'bg-white/3 border border-white/5'
                  )}
                >
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Risk Bar</span>
                  <div className="flex gap-1">
                    <div className="w-8 h-1.5 rounded-full bg-trade-positive/50" />
                    <div className="w-6 h-1.5 rounded-full bg-yellow-500/50" />
                    <div className="w-4 h-1.5 rounded-full bg-trade-negative/50" />
                  </div>
                </motion.div>

                {/* Watchlist */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  onMouseEnter={() => setActivePanel('watchlist')}
                  onMouseLeave={() => setActivePanel(null)}
                  className={cn(
                    'row-span-1 rounded-lg p-2 flex flex-col gap-1 transition-all duration-300 cursor-pointer',
                    activePanel === 'watchlist' ? 'bg-primary/15 border border-primary/30' : 'bg-white/3 border border-white/5'
                  )}
                >
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Watchlist</span>
                  <div className="flex flex-col gap-0.5">
                    {['BTC', 'ETH', 'SOL'].map(s => (
                      <div key={s} className="flex items-center justify-between">
                        <span className="text-[8px] text-foreground/70">{s}</span>
                        <span className="text-[8px] text-trade-positive">+1.2%</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Chart */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onMouseEnter={() => setActivePanel('chart')}
                  onMouseLeave={() => setActivePanel(null)}
                  className={cn(
                    'col-span-2 row-span-1 rounded-lg p-2 flex flex-col gap-1 transition-all duration-300 cursor-pointer',
                    activePanel === 'chart' ? 'bg-primary/15 border border-primary/30' : 'bg-white/3 border border-white/5'
                  )}
                >
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">OHLCV Chart</span>
                  {/* Mini candlestick mockup */}
                  <div className="flex-1 flex items-end gap-[3px] px-2">
                    {[40, 55, 45, 60, 50, 70, 65, 75, 60, 80, 70, 85, 75, 90, 82].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end">
                        <div
                          className={cn(
                            'w-full rounded-sm',
                            i % 3 === 0 ? 'bg-trade-negative/60' : 'bg-trade-positive/60'
                          )}
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Order Ticket */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.65 }}
                  onMouseEnter={() => setActivePanel('ticket')}
                  onMouseLeave={() => setActivePanel(null)}
                  className={cn(
                    'row-span-1 rounded-lg p-2 flex flex-col gap-1 transition-all duration-300 cursor-pointer',
                    activePanel === 'ticket' ? 'bg-primary/15 border border-primary/30' : 'bg-white/3 border border-white/5'
                  )}
                >
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Order Ticket</span>
                  <div className="flex gap-1 mt-1">
                    <div className="flex-1 py-1 rounded text-[8px] text-center bg-trade-positive/20 text-trade-positive font-bold">BUY</div>
                    <div className="flex-1 py-1 rounded text-[8px] text-center bg-trade-negative/20 text-trade-negative font-bold">SELL</div>
                  </div>
                  <div className="h-2 rounded bg-white/5 mt-0.5" />
                  <div className="h-2 rounded bg-white/5" />
                </motion.div>

                {/* Order Book */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  onMouseEnter={() => setActivePanel('orderbook')}
                  onMouseLeave={() => setActivePanel(null)}
                  className={cn(
                    'rounded-lg p-2 flex flex-col gap-0.5 transition-all duration-300 cursor-pointer',
                    activePanel === 'orderbook' ? 'bg-primary/15 border border-primary/30' : 'bg-white/3 border border-white/5'
                  )}
                >
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Order Book</span>
                  {[60, 45, 30].map((w, i) => (
                    <div key={i} className="flex gap-0.5">
                      <div className="flex-1 h-1.5 rounded-sm bg-trade-positive/30" style={{ width: `${w}%` }} />
                      <div className="flex-1 h-1.5 rounded-sm bg-trade-negative/30" style={{ width: `${70-w}%` }} />
                    </div>
                  ))}
                </motion.div>

                {/* Blotter */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.75 }}
                  onMouseEnter={() => setActivePanel('blotter')}
                  onMouseLeave={() => setActivePanel(null)}
                  className={cn(
                    'col-span-3 rounded-lg p-2 transition-all duration-300 cursor-pointer',
                    activePanel === 'blotter' ? 'bg-primary/15 border border-primary/30' : 'bg-white/3 border border-white/5'
                  )}
                >
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Position Blotter</span>
                  <div className="flex gap-4 mt-1">
                    {['BTC +2.5', 'ETH -1.0', 'SOL +50'].map(p => (
                      <span key={p} className={cn(
                        'text-[8px] font-mono',
                        p.includes('+') ? 'text-trade-positive/70' : 'text-trade-negative/70'
                      )}>{p}</span>
                    ))}
                    <span className="text-[8px] text-trade-positive/70 ml-auto">PnL: +$2,450</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Panel details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="w-[280px] flex flex-col gap-3"
          >
            {/* Panel detail card — always shown, content changes */}
            <div className="glass-card-strong p-5 border-glow min-h-[160px]">
              {selectedPanel ? (
                <motion.div
                  key={selectedPanel.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 text-primary mb-3">
                    {selectedPanel.icon}
                    <h4 className="text-base font-bold">{selectedPanel.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed" style={{ fontFamily: 'Itau Text' }}>
                    {selectedPanel.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPanel.features.map(f => (
                      <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-4">
                  <Monitor className="w-8 h-8 text-muted-foreground/20" />
                  <p className="text-xs text-muted-foreground/50" style={{ fontFamily: 'Itau Text' }}>
                    Passe o mouse sobre os painéis para ver detalhes
                  </p>
                </div>
              )}
            </div>

            {/* Compact panel grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {panels.map((panel, i) => (
                <motion.div
                  key={panel.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.04 }}
                  onMouseEnter={() => setActivePanel(panel.id)}
                  onMouseLeave={() => setActivePanel(null)}
                  className={cn(
                    'glass-card px-2.5 py-2 flex items-center gap-2 cursor-pointer transition-all duration-200',
                    activePanel === panel.id ? 'border-glow bg-primary/5' : 'hover:bg-white/3'
                  )}
                >
                  <div className={cn(
                    'transition-colors',
                    activePanel === panel.id ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {panel.icon}
                  </div>
                  <span className={cn(
                    'text-[11px] font-medium transition-colors',
                    activePanel === panel.id ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {panel.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
