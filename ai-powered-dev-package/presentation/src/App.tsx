import { useSlideNavigation } from '@/hooks/useSlideNavigation'
import { SlideTransition } from '@/components/SlideTransition'
import { BottomNav } from '@/components/BottomNav'
import { CoverSlide } from '@/slides/CoverSlide'
import { ProblemSlide } from '@/slides/ProblemSlide'
import { VisionSlide } from '@/slides/VisionSlide'
import { MarketDataSlide } from '@/slides/MarketDataSlide'
import { PricingSlide } from '@/slides/PricingSlide'
import { ExecutionSlide } from '@/slides/ExecutionSlide'
import { CockpitSlide } from '@/slides/CockpitSlide'
import { ArchitectureSlide } from '@/slides/ArchitectureSlide'
import { RoadmapSlide } from '@/slides/RoadmapSlide'
import { ClosingSlide } from '@/slides/ClosingSlide'

const slides = [
  { component: CoverSlide, label: 'Início' },
  { component: ProblemSlide, label: 'O Desafio' },
  { component: VisionSlide, label: 'A Visão' },
  { component: MarketDataSlide, label: 'Dados de Mercado' },
  { component: PricingSlide, label: 'Precificação' },
  { component: ExecutionSlide, label: 'Execução' },
  { component: CockpitSlide, label: 'Cockpit' },
  { component: ArchitectureSlide, label: 'Arquitetura' },
  { component: RoadmapSlide, label: 'Roadmap' },
  { component: ClosingSlide, label: 'Encerramento' },
]

export function App() {
  const nav = useSlideNavigation(slides.length)
  const CurrentSlide = slides[nav.currentSlide].component

  return (
    <div className="h-full w-full relative overflow-hidden bg-background">
      <SlideTransition slideKey={nav.currentSlide} direction={nav.direction}>
        <CurrentSlide />
      </SlideTransition>

      <BottomNav
        currentSlide={nav.currentSlide}
        totalSlides={slides.length}
        slideLabels={slides.map(s => s.label)}
        onGoToSlide={nav.goToSlide}
        onPrev={nav.prevSlide}
        onNext={nav.nextSlide}
        isFirst={nav.isFirst}
        isLast={nav.isLast}
      />
    </div>
  )
}
