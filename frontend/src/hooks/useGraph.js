import { useState, useCallback } from 'react'
import { getGraph } from '../services/api'

export function useGraph() {
  const [graph, setGraph] = useState({ nodes: [], edges: [], metadata: {} })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadGraph = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getGraph()
      setGraph({
        nodes: data.nodes || [],
        edges: data.edges || [],
        metadata: data.metadata || {},
      })
    } catch (err) {
      setError(err.message || 'Failed to load graph')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshGraph = useCallback(async () => {
    await loadGraph()
  }, [loadGraph])

  return { graph, loading, error, loadGraph, refreshGraph }
}
