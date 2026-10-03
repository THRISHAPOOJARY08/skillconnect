import { useState, useEffect } from 'react'

/**
 * Tracks activity indicators during an answer session:
 * - Tab visibility changes
 * - Window focus/blur
 * - Copy and Paste events within the given textareaRef
 *
 * Returns neutral activity data — not evidence of cheating.
 */
export function useActivityMonitor(textareaRef) {
  const [events, setEvents]       = useState([])
  const [tabSwitches, setTabs]    = useState(0)
  const [copyCount, setCopy]      = useState(0)
  const [pasteCount, setPaste]    = useState(0)

  const addEvent = (type, metadata = null) => {
    const entry = { eventType: type, timestamp: new Date().toISOString(), metadata }
    setEvents(prev => [...prev, entry])
  }

  useEffect(() => {
    // Tab visibility
    const handleVisibility = () => {
      if (document.hidden) {
        addEvent('TAB_HIDDEN')
        setTabs(n => n + 1)
      } else {
        addEvent('TAB_VISIBLE')
      }
    }

    // Window blur/focus
    const handleBlur  = () => addEvent('WINDOW_BLUR')
    const handleFocus = () => addEvent('WINDOW_FOCUS')

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  useEffect(() => {
    const el = textareaRef?.current
    if (!el) return

    const handleCopy = () => { addEvent('COPY'); setCopy(n => n + 1) }
    const handlePaste = () => { addEvent('PASTE'); setPaste(n => n + 1) }

    el.addEventListener('copy',  handleCopy)
    el.addEventListener('paste', handlePaste)
    return () => {
      el.removeEventListener('copy',  handleCopy)
      el.removeEventListener('paste', handlePaste)
    }
  }, [textareaRef])

  return { events, tabSwitches, copyCount, pasteCount }
}
