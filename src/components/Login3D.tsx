'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float, Environment } from '@react-three/drei'
import { useRef, useState, Suspense, useEffect } from 'react'
import { Mesh } from 'three'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { Github, Sparkles, Loader2 } from 'lucide-react'

interface FloatingCubeProps {
  position: [number, number, number]
  color: string
}

function FloatingCube({ position, color }: FloatingCubeProps) {
  const meshRef = useRef<Mesh>(null!)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
    </Float>
  )
}

function CodeSphere() {
  const meshRef = useRef<Mesh>(null!)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#4f46e5" wireframe transparent opacity={0.6} />
      </mesh>
    </Float>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-white/60 flex flex-col items-center">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <span className="text-sm">Loading 3D scene...</span>
      </div>
    </div>
  )
}

function Scene3D({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={0.5} />
      
      <CodeSphere />
      
      <FloatingCube position={[-3, 1.5, -1.5]} color="#10b981" />
      <FloatingCube position={[3, -1.5, -1.5]} color="#f59e0b" />
      <FloatingCube position={[-2.5, -2.5, 1.5]} color="#ef4444" />
      <FloatingCube position={[2.5, 2.5, 1.5]} color="#8b5cf6" />
      
      <Text
        position={[0, isMobile ? 3 : 4, 0]}
        fontSize={isMobile ? 0.8 : 1.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={isMobile ? 8 : 12}
      >
        DocifyByMe
      </Text>
      
      <Text
        position={[0, isMobile ? 1.8 : 2.5, 0]}
        fontSize={isMobile ? 0.25 : 0.4}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
        maxWidth={isMobile ? 6 : 10}
      >
        Generate beautiful documentation for your GitHub repositories
      </Text>
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </>
  )
}

export default function Login3D() {
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleGitHubLogin = async () => {
    setIsLoading(true)
    try {
      await signIn('github', { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <Suspense fallback={<LoadingFallback />}>
          <Canvas 
            camera={{ 
              position: [0, 0, isMobile ? 6 : 8], 
              fov: isMobile ? 85 : 75 
            }}
            performance={{ min: 0.5 }}
            dpr={isMobile ? [1, 1.5] : [1, 2]}
          >
            <Scene3D isMobile={isMobile} />
          </Canvas>
        </Suspense>
      </div>

      {/* Overlay UI */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl border border-white/20 max-w-md w-full"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mb-6 sm:mb-8"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-sm sm:text-base text-gray-300">Sign in to generate amazing documentation</p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full bg-[#24292e] hover:bg-[#1a1e22] text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Github className="w-5 h-5" />
              )}
              <span className="text-sm sm:text-base">
                {isLoading ? 'Signing in...' : 'Continue with GitHub'}
              </span>
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="text-xs sm:text-sm text-gray-400 mt-4 sm:mt-6"
            >
              We&apos;ll access your public repositories to generate documentation
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-48 h-48 sm:w-72 sm:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -top-4 -right-4 w-48 h-48 sm:w-72 sm:h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-8 left-10 sm:left-20 w-48 h-48 sm:w-72 sm:h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" style={{ animationDelay: '4s' }} />
      </div>
    </div>
  )
}
