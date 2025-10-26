import { useEffect, useState } from "react"

/**
 * Simple debounce hook: returns the value only after it hasn't changed for `delay` ms.
 */
export default function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return debounced
}
