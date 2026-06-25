'use client'
import { useState, useRef } from 'react'
import ModelViewer from '@/components/ModelViewer'
import { motion } from 'framer-motion'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function ImageTo3D() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [modelUrl, setModelUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
    }
  }

  const generate = async () => {
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API}/api/image-to-3d`, { method: 'POST', body: form })
    const { job_id } = await res.json()
    const poll = setInterval(async () => {
      const s = await fetch(`${API}/api/status/${job_id}`)
      const d = await s.json()
      if (d.ready) {
        setModelUrl(`${API}/api/model/${job_id}`)
        setLoading(false)
        clearInterval(poll)
      }
    }, 2000)
    setTimeout(() => clearInterval(poll), 120000)
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] max-w-5xl mx-auto px-4 py-16">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold mb-4">
        Image to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">3D</span>
      </motion.h1>
      <p className="text-gray-400 mb-8 text-lg">Upload an image and AI will convert it into a 3D model</p>
      <div className="bg-[#15152a] rounded-2xl p-6 mb-8 border border-gray-800">
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 transition-colors"
        >
          {preview ? (
            <img src={preview} alt="preview" className="max-h-64 mx-auto rounded-lg" />
          ) : (
            <div>
              <div className="text-4xl mb-2">📁</div>
              <p className="text-gray-400">Click to upload an image</p>
              <p className="text-gray-600 text-sm">PNG, JPG, WEBP</p>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
        <button
          onClick={generate}
          disabled={loading || !file}
          className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 transition-all"
        >
          {loading ? 'Generating...' : 'Generate 3D Model'}
        </button>
      </div>
      {modelUrl && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <ModelViewer url={modelUrl} />
        </motion.div>
      )}
    </div>
  )
}
