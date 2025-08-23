'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float, Environment } from '@react-three/drei'
import { useRef, useState, Suspense, useEffect, useCallback, useMemo } from 'react'
import { Mesh } from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { Github, Sparkles, Loader2 } from 'lucide-react'

interface FloatingCubeProps {
  position: [number, number, number]
  color: string
  speed?: number
}

function FloatingCube({ position, color, speed = 1 }: FloatingCubeProps) {
  const meshRef = useRef<Mesh>(null!)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5 * speed
      meshRef.current.rotation.y += delta * 0.3 * speed
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.8}
          roughness={0.3}
          metalness={0.1}
        />
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
        <meshStandardMaterial 
          color="#4f46e5" 
          wireframe 
          transparent 
          opacity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full" role="status" aria-label="Loading 3D scene">
      <motion.div 
        className="text-white/60 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <span className="text-sm">Loading 3D scene...</span>
      </motion.div>
    </div>
  )
}

function Scene3D({ isMobile, isReducedMotion }: { isMobile: boolean; isReducedMotion: boolean }) {
  const cubePositions = useMemo(() => [
    [-3, 1.5, -1.5],
    [3, -1.5, -1.5],
    [-2.5, -2.5, 1.5],
    [2.5, 2.5, 1.5]
  ], [])

  const cubeColors = useMemo(() => [
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6"  // purple
  ], [])

  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={0.5} />
      
      <CodeSphere />
      
      {cubePositions.map((position, index) => (
        <FloatingCube 
          key={index}
          position={position as [number, number, number]} 
          color={cubeColors[index]}
          speed={isReducedMotion ? 0.1 : 1}
        />
      ))}
      
      <Text
        position={[0, isMobile ? 3 : 4, 0]}
        fontSize={isMobile ? 0.8 : 1.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={isMobile ? 8 : 12}
        font="/fonts/Inter-Bold.woff"
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
        font="/fonts/Inter-Regular.woff"
      >
        Generate beautiful documentation for your GitHub repositories
      </Text>
    </>
  )
}

export default function Login3D() {
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFeatures, setShowFeatures] = useState(false)

  // Check for mobile device and reduced motion preference
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    const checkReducedMotion = () => {
      setIsReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    }
    
    checkDevice()
    checkReducedMotion()
    
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkDevice, 100)
    }
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', checkReducedMotion)
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      mediaQuery.removeEventListener('change', checkReducedMotion)
      clearTimeout(timeoutId)
    }
  }, [])

  // Show features after initial animation
  useEffect(() => {
    const timer = setTimeout(() => setShowFeatures(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleGitHubLogin = useCallback(async () => {
    if (isLoading) return // Prevent multiple clicks
    
    setIsLoading(true)
    setError(null)
    
    try {
      await signIn('github', { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Login error:', error)
      setError('Failed to sign in. Please try again.')
      setIsLoading(false)
    }
  }, [isLoading])

  const features = [
    { icon: "🔗", text: "Connect your GitHub repositories", color: "bg-green-400" },
    { icon: "📚", text: "Generate comprehensive documentation", color: "bg-blue-400" },
    { icon: "🤖", text: "Powered by advanced AI models", color: "bg-purple-400" }
  ]

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
            gl={{ 
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              stencil: false,
              depth: true
            }}
          >
            <Scene3D isMobile={isMobile} isReducedMotion={isReducedMotion} />
            <OrbitControls 
              enableZoom={false}
              enablePan={false}
              autoRotate={!isReducedMotion}
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Overlay UI */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.2,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 lg:p-12 max-w-md w-full border border-white/20 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.4,
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2"
            >
              DocifyByMe
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-gray-300 text-base sm:text-lg"
            >
              AI-Powered Documentation Generator
            </motion.p>
          </div>

          {/* Features */}
          <AnimatePresence>
            {showFeatures && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6 sm:mb-8 space-y-3"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-center space-x-3 text-gray-300"
                  >
                    <div className={`w-2 h-2 ${feature.color} rounded-full flex-shrink-0`}></div>
                    <span className="text-sm sm:text-base">{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mb-6 bg-red-500/20 border border-red-400/30 rounded-lg p-3"
                role="alert"
                aria-live="polite"
              >
                <p className="text-red-200 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-3 focus-ring shadow-lg"
            aria-label={isLoading ? "Signing in to GitHub..." : "Continue with GitHub"}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <Github className="w-5 h-5" />
                <span>Continue with GitHub</span>
              </>
            )}
          </motion.button>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-400 text-xs sm:text-sm">
              Secure authentication via GitHub OAuth
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Background Particles */}
      {!isReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100 }}
              animate={{ 
                opacity: [0, 1, 0],
                y: [-100, 100],
                x: Math.sin(i) * 50
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
