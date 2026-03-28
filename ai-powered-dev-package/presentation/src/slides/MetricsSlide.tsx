import { motion } from 'framer-motion'
import { BarChart3, Activity, Code2, Shield } from 'lucide-react'
import { AnimatedCounter } from '@/components/AnimatedCounter'

const metricGroups = [
  {
    title: 'Capacidades de Negócio',
    icon: <Activity className="w-4 h-4" />,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    metrics: [
      { label: 'Assets Suportados', value: 50, suffix: '+', desc: 'Criptomoedas spot e futuros' },
      { label: 'Tipos de Ordem', value: 4, suffix: '', desc: 'Market, Limit, BBO, TWAP' },
      { label: 'Canais de Distribuição', value: 3, suffix: '', desc: 'Retail, Corporate, Institutional' },
      { label: 'Tiers de Liquidez', value: 5, suffix: '', desc: 'Profundidade de preço por camada' },
    ],
  },
  {
    title: 'Performance',
    icon: <BarChart3 className="w-4 h-4" />,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    borderColor: 'border-chart-2/20',
    metrics: [
      { label: 'Latência de Pricing', value: 50, prefix: '<', suffix: 'ms', desc: 'Do tick ao preço do cliente' },
      { label: 'Disponibilidade', value: 24, suffix: '/7', desc: 'Operação contínua' },
      { label: 'Cache de Cotação', value: 1, prefix: '<', suffix: 'ms', desc: 'Leitura sub-milissegundo' },
      { label: 'Canais de Streaming', value: 4, suffix: '', desc: 'Tickers, books, trades, candles' },
    ],
  },
  {
    title: 'Engenharia',
    icon: <Code2 className="w-4 h-4" />,
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    borderColor: 'border-chart-3/20',
    metrics: [
      { label: 'Linhas de Código', value: 30, suffix: 'k+', desc: 'Backend + Frontend' },
      { label: 'Testes Unitários', value: 271, suffix: '+', desc: '100% passando' },
      { label: 'Endpoints de API', value: 50, suffix: '+', desc: '7 serviços backend' },
      { label: 'WebSocket Hubs', value: 5, suffix: '+', desc: 'Distribuição real-time' },
    ],
  },
  {
    title: 'Qualidade & Risco',
    icon: <Shield className="w-4 h-4" />,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    borderColor: 'border-chart-4/20',
    metrics: [
      { label: 'Compilação', value: 100, suffix: '%', desc: 'Zero erros de build' },
      { label: 'Testes Passando', value: 100, suffix: '%', desc: 'Suite completa verde' },
      { label: 'Admin CRUDs', value: 8, suffix: '', desc: 'Gestão completa de entidades' },
      { label: 'Schemas de Dados', value: 5, suffix: '', desc: 'Isolamento por domínio' },
    ],
  },
]

export function MetricsSlide() {
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
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Métricas & Capacidades
            </span>
          </div>
          <h2 className="text-4xl font-black leading-tight" style={{ fontFamily: 'Itau Display' }}>
            Os números por trás
            <br />
            <span className="text-muted-foreground">da plataforma.</span>
          </h2>
        </motion.div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-5">
          {metricGroups.map((group, gi) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + gi * 0.12 }}
              className={`glass-card p-5 border ${group.borderColor}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-1.5 rounded-lg ${group.bgColor} ${group.color}`}>
                  {group.icon}
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {group.metrics.map((metric) => (
                  <div key={metric.label} className="group">
                    <div className={`text-2xl font-black ${group.color} tabular-nums`}>
                      <AnimatedCounter
                        value={metric.value}
                        prefix={metric.prefix}
                        suffix={metric.suffix}
                        duration={1.5}
                        className={`text-2xl font-black ${group.color} tabular-nums`}
                      />
                    </div>
                    <div className="text-xs font-semibold text-foreground mt-0.5">{metric.label}</div>
                    <div className="text-[10px] text-muted-foreground" style={{ fontFamily: 'Itau Text' }}>
                      {metric.desc}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
