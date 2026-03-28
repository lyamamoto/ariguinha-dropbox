import { motion } from 'framer-motion'
import { Radio, Database, BarChart3, Monitor, Wifi } from 'lucide-react'

const stages = [
  {
    icon: <Wifi className="w-6 h-6" />,
    title: 'Fontes de Mercado',
    subtitle: 'Exchanges & Provedores',
    items: ['Binance Spot', 'Binance Futures', '+ Fontes futuras'],
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    borderColor: 'border-chart-2/20',
  },
  {
    icon: <Radio className="w-6 h-6" />,
    title: 'Normalização',
    subtitle: 'Workers Adaptativos',
    items: ['Formato unificado', 'Arquitetura plugável', 'Novas fontes sem reescrita'],
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    borderColor: 'border-chart-3/20',
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: 'Streaming',
    subtitle: 'Barramento de Eventos',
    items: ['Tickers em tempo real', 'Order books L2', 'Trades & Candles'],
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Processamento',
    subtitle: 'Consumo Independente',
    items: ['Feeder (visualização)', 'Motor de preço (LP)', 'Histórico (OHLCV)'],
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    borderColor: 'border-chart-4/20',
  },
  {
    icon: <Monitor className="w-6 h-6" />,
    title: 'Visualização',
    subtitle: 'Cockpit do Trader',
    items: ['Watchlist live', 'Gráficos OHLCV', 'Order book depth'],
    color: 'text-trade-positive',
    bgColor: 'bg-trade-positive/10',
    borderColor: 'border-trade-positive/20',
  },
]

export function MarketDataSlide() {
  return (
    <div className="slide bg-gradient-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-chart-2/50 to-transparent" />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <Radio className="w-5 h-5 text-chart-2" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-chart-2">
              Dados de Mercado
            </span>
          </div>
          <h2 className="text-4xl font-black leading-tight" style={{ fontFamily: 'Itau Display' }}>
            Do mercado ao trader
            <br />
            <span className="text-muted-foreground">em milissegundos.</span>
          </h2>
        </motion.div>

        {/* Flow pipeline */}
        <div className="flex items-stretch gap-3">
          {stages.map((stage, i) => (
            <motion.div
              key={stage.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
              className="flex-1 flex flex-col"
            >
              {/* Card */}
              <div className={`glass-card p-5 flex-1 flex flex-col border ${stage.borderColor} group hover:glow-primary transition-all duration-300`}>
                <div className={`p-2.5 rounded-lg ${stage.bgColor} ${stage.color} w-fit mb-3`}>
                  {stage.icon}
                </div>
                <h4 className="text-base font-bold text-foreground mb-0.5">{stage.title}</h4>
                <p className="text-xs text-muted-foreground mb-3" style={{ fontFamily: 'Itau Text' }}>
                  {stage.subtitle}
                </p>
                <ul className="flex flex-col gap-1.5 mt-auto">
                  {stage.items.map((item) => (
                    <li key={item} className="text-xs text-muted-foreground flex items-center gap-2">
                      <div className={`w-1 h-1 rounded-full ${stage.bgColor.replace('/10', '/50')}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Arrow connector (except last) */}
              {i < stages.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.12 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Metrics bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-8 flex items-center justify-center gap-10"
        >
          {[
            { label: 'Fontes de dados', value: 'Plugável' },
            { label: 'Atualização', value: 'Tempo real' },
            { label: 'Consumidores', value: 'Independentes' },
            { label: 'Disponibilidade', value: '24/7' },
          ].map((metric) => (
            <div key={metric.label} className="text-center">
              <div className="text-lg font-black text-primary">{metric.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{metric.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
