import { motion } from 'framer-motion'
import { AlertTriangle, Clock, Unplug, Shield, TrendingDown } from 'lucide-react'

const painPoints = [
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Operação Frágil',
    description: 'Plataforma que reinicia diariamente, limites de risco em arquivos estáticos, e controle operacional restrito a um desktop no escritório.',
  },
  {
    icon: <Unplug className="w-6 h-6" />,
    title: 'Pontos Cegos',
    description: 'Lógica de negócio fragmentada e sem cobertura de testes. Mudanças no sistema são apostas sem rede de proteção.',
  },
  {
    icon: <TrendingDown className="w-6 h-6" />,
    title: 'Preso ao Passado',
    description: 'Infraestrutura física que não pode migrar para nuvem, dependência de fornecedor com pool de especialistas diminuindo a cada ano.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Risco Operacional',
    description: 'Sem testes automatizados, sem observabilidade centralizada, sem reconciliação pós-trade. Cada deploy é um risco.',
  },
]

export function ProblemSlide() {
  return (
    <div className="slide bg-gradient-dark relative overflow-hidden">
      {/* Subtle danger accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-trade-negative/50 to-transparent" />

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-3"
        >
          <AlertTriangle className="w-5 h-5 text-trade-negative" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-trade-negative">
            O Desafio
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-4xl font-black mb-3 leading-tight"
          style={{ fontFamily: 'Itau Display' }}
        >
          O legado não acompanha
          <br />
          <span className="text-muted-foreground">a velocidade do mercado.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-base text-muted-foreground mb-10 max-w-2xl"
          style={{ fontFamily: 'Itau Text' }}
        >
          O mercado opera 24/7. A plataforma atual desliga toda noite.
          Em um ambiente de volatilidade constante, essa fragilidade se traduz em oportunidades perdidas e risco acumulado.
        </motion.p>

        {/* Pain points grid */}
        <div className="grid grid-cols-2 gap-5">
          {painPoints.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
              className="glass-card p-6 group hover:border-trade-negative/20 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-trade-negative/10 text-trade-negative shrink-0 group-hover:bg-trade-negative/15 transition-colors">
                  {point.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1.5 text-foreground">{point.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: 'Itau Text' }}>
                    {point.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom impact statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground/70 italic" style={{ fontFamily: 'Itau Text' }}>
            "Cada ano sem modernizar é mais um ano acumulando risco em uma plataforma que ninguém novo consegue operar."
          </p>
        </motion.div>
      </div>
    </div>
  )
}
