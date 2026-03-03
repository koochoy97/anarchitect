import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ToastProps {
  message: string
  visible: boolean
  onDone: () => void
  duration?: number
}

export default function Toast({ message, visible, onDone, duration = 2500 }: ToastProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      // Trigger enter animation on next frame
      requestAnimationFrame(() => setShow(true))
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onDone, 300) // wait for exit animation
      }, duration)
      return () => clearTimeout(timer)
    } else {
      setShow(false)
    }
  }, [visible, duration, onDone])

  if (!visible) return null

  return createPortal(
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg border border-accent-muted bg-surface-raised text-sm font-medium text-ink transition-all duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent/15">
        <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </span>
      {message}
    </div>,
    document.body
  )
}
