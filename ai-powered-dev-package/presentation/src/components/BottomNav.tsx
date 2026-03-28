import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  currentSlide: number
  totalSlides: number
  slideLabels: string[]
  onGoToSlide: (index: number) => void
  onPrev: () => void
  onNext: () => void
  isFirst: boolean
  isLast: boolean
}

const HIDE_DELAY = 3000
const HOVER_ZONE_HEIGHT = 40

export function BottomNav({
  currentSlide,
  totalSlides,
  slideLabels,
  onGoToSlide,
  onPrev,
  onNext,
  isFirst,
  isLast,
}: BottomNavProps) {
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const interactingRef = useRef(false)

  const show = useCallback(() => {
    setVisible(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!interactingRef.current) setVisible(false)
    }, HIDE_DELAY)
  }, [])

  // Show on slide change
  useEffect(() => {
    show()
  }, [currentSlide, show])

  // Show on arrow key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        show()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [show])

  // Show when mouse enters bottom zone
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY >= window.innerHeight - HOVER_ZONE_HEIGHT) {
        show()
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [show])

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleNavEnter = () => {
    interactingRef.current = true
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(true)
  }

  const handleNavLeave = () => {
    interactingRef.current = false
    timerRef.current = setTimeout(() => setVisible(false), HIDE_DELAY)
  }

  return (
    <>
      {/* Progress bar — always visible */}
      <div className="fixed bottom-0 left-0 right-0 z-50 h-[2px] bg-muted/20">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Navigation bar — auto-hide */}
      <AnimatePresence>
        {visible && (
          <motion.div
            ref={navRef}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onMouseEnter={handleNavEnter}
            onMouseLeave={handleNavLeave}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            {/* Progress bar on top of nav */}
            <div className="h-[2px] bg-muted/30">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            <div className="glass-card-strong flex items-center justify-between px-6 py-3" style={{ borderRadius: 0 }}>
              {/* Prev button */}
              <button
                onClick={onPrev}
                disabled={isFirst}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  isFirst
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              {/* Slide dots */}
              <div className="flex items-center gap-1.5">
                {slideLabels.map((label, index) => (
                  <button
                    key={index}
                    onClick={() => onGoToSlide(index)}
                    className="group relative flex items-center justify-center"
                    title={label}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        index === currentSlide
                          ? "bg-primary w-8"
                          : index < currentSlide
                            ? "bg-primary/40 hover:bg-primary/60"
                            : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                    />
                    <div className="absolute bottom-full mb-2 px-2 py-1 bg-card text-xs text-foreground rounded-md border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {label}
                    </div>
                  </button>
                ))}
              </div>

              {/* Slide counter + Next */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {currentSlide + 1} / {totalSlides}
                </span>
                <button
                  onClick={onNext}
                  disabled={isLast}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    isLast
                      ? "text-muted-foreground/30 cursor-not-allowed"
                      : "text-primary hover:text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  <span className="hidden sm:inline">Próximo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
