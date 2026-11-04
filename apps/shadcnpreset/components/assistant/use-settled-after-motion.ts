"use client"

import * as React from "react"

/**
 * `value`, once the element has finished the motion a change to it set off,
 * so heavy content can wait for the element to stop moving. Where nothing
 * moves (no transition, reduced motion, jsdom) it follows straight away.
 */
export function useSettledAfterMotion<T>(
  value: T,
  ref: React.RefObject<Element | null>
): T {
  const [settled, setSettled] = React.useState(value)
  React.useEffect(() => {
    if (value === settled) return
    let current = true
    const motion = ref.current?.getAnimations?.() ?? []
    void Promise.allSettled(motion.map((m) => m.finished)).then(() => {
      if (current) setSettled(value)
    })
    return () => {
      current = false
    }
  }, [value, settled, ref])
  return settled
}
