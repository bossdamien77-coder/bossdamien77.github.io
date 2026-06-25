import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#0a0a12]/80 backdrop-blur-md border-b border-gray-800">
      <Link href="/" className="text-xl font-bold">
        3D<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Forge</span>
      </Link>
      <div className="flex gap-6">
        <Link href="/generate" className="text-gray-400 hover:text-white transition-colors">Text to 3D</Link>
        <Link href="/generate/image" className="text-gray-400 hover:text-white transition-colors">Image to 3D</Link>
      </div>
    </nav>
  )
}
