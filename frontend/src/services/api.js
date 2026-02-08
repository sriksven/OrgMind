import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

function unwrapError(err) {
  if (err?.response?.data?.detail) return err.response.data.detail
  return err?.message || 'Request failed'
}

export async function getHealth() {
  try {
    const { data } = await api.get('/health')
    return data
  } catch (err) {
    throw new Error(unwrapError(err))
  }
}

export async function getGraph() {
  try {
    const { data } = await api.get('/graph')
    return data
  } catch (err) {
    throw new Error(unwrapError(err))
  }
}

export async function processInformation(payload) {
  try {
    const { data } = await api.post('/process', payload)
    return data
  } catch (err) {
    throw new Error(unwrapError(err))
  }
}

export async function queryKnowledge(question) {
  try {
    const { data } = await api.post('/query', { question })
    return data
  } catch (err) {
    throw new Error(unwrapError(err))
  }
}

export async function getAgentStatus() {
  try {
    const { data } = await api.get('/agents/status')
    return data
  } catch (err) {
    throw new Error(unwrapError(err))
  }
}

export async function getDemoScenarios() {
  try {
    const { data } = await api.get('/demo/scenarios')
    return data
  } catch (err) {
    throw new Error(unwrapError(err))
  }
}

export async function runDemoScenario(id) {
  try {
    const { data } = await api.post(`/demo/run/${id}`)
    return data
  } catch (err) {
    throw new Error(unwrapError(err))
  }
}

export async function listAgents() {
  try {
    const { data } = await api.get('/agents')
    return data
  } catch (err) {
    throw new Error(unwrapError(err))
  }
}

export async function agentProcess(payload) {
  try {
    const { data } = await api.post('/agent/process', payload)
    return data
  } catch (err) {
    throw new Error(unwrapError(err))
  }
}

export default api
