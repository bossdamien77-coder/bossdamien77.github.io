'use client'
import { useState } from 'react'
import ModelViewer from '@/components/ModelViewer'
import { motion } from 'framer-motion'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function TextTo3D() {
  const [prompt, setPrompt] = useState('')
  const [modelUrl, setModelUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')

  const examples = [
    'a red leather armchair',
    'a medieval stone castle',
    'a cyberpunk robot head',
    'an ancient greek vase',
  ]

  const generate = async () => {
    setLoading(true)
    setProgress('🧠 AI is thinking...')
    const res = await fetch(`${API}/api/text-to-3d`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    const { job_id } = await res.json()
    setProgress('🎨 Generating 3D model...')
    const poll = setInterval(async () => {
      const s = await fetch(`${API}/api/status/${job_id}`)
      const d = await s.json()
      if (d.ready) {
        setModelUrl(`${API}/api/model/${job_id}`)
        setLoading(false)
        setProgress('')
        clearInterval(poll)
      }
    }, 2000)
    setTimeout(() => clearInterval(poll), 120000)
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] max-w-5xl mx-auto px-4 py-16">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold mb-4">
        Text to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">3D</span>
      </motion.h1>
      <p className="text-gray-400 mb-8 text-lg">Describe anything and watch AI bring it to life in 3D</p>
      <div className="bg-[#15152a] rounded-2xl p-6 mb-8 border border-gray-800">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="Describe your 3D model..."
            className="flex-1 p-4 rounded-xl bg-[#1a1a35] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-lg"
          />
          <button
            onClick={generate}
            disabled={loading || !prompt}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 transition-all"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {examples.map(ex => (
            <button key={ex} onClick={() => setPrompt(ex)}
              className="px-3 py-1.5 text-sm rounded-full bg-[#1a1a35] border border-gray-700 text-gray-400 hover:border-purple-500 hover:text-white transition-colors">
              {ex}
            </button>
          ))}
        </div>
      </div>
      {progress && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mb-4"></div>
          <p className="text-gray-400">{progress}</p>
        </div>
      )}
      {modelUrl && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <ModelViewer url={modelUrl} />
          <div className="flex justify-center gap-4 mt-6">
            <a href={modelUrl} download className="px-6 py-3 bg-green-600 rounded-xl hover:bg-green-700 transition-colors font-medium">
              ⬇ Download GLB
            </a>
          </div>
        </motion.div>
      )}
    </div>
  )
}
