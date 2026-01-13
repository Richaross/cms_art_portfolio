'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white p-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-neutral-900 border border-white/10 p-8 rounded-2xl shadow-2xl relative space-y-8" // Updated className for motion.div
            >
                <div className="absolute top-6 left-6">
                    <Link href="/" className="text-gray-500 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                </div>
                <div className="text-center mb-8 mt-4">
                    <h1 className="text-3xl font-bold tracking-tighter text-white">Owner Access</h1>
                    <p className="text-gray-400 mt-2 text-sm">Welcome back, creator.</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <input
                                type="email"
                                required
                                className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-gray-200 focus:outline-none disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
