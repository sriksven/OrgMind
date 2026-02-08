import { useState, useEffect, useCallback, useRef } from 'react'
import { getAgentStatus } from '../services/api'

export function useAgents() {
  const [agentStatus, setAgentStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isPolling, setIsPolling] = useState(true)
  const timerRef = useRef(null)

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAgentStatus()
      setAgentStatus(data)
      setLastUpdated(new Date().toISOString())
    } catch (err) {
      setError(err.message || 'Agent status failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isPolling) return undefined
    fetchStatus()
    timerRef.current = setInterval(fetchStatus, 5000) // Changed from 2s to 5s to reduce load
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPolling]) // Removed fetchStatus from deps to prevent re-creation

  const pause = useCallback(() => setIsPolling(false), [])
  const resume = useCallback(() => setIsPolling(true), [])

  return { agentStatus, loading, error, lastUpdated, isPolling, pause, resume, refresh: fetchStatus }
}
