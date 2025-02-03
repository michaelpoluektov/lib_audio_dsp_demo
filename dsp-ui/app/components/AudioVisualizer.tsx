"use client"

import { useRef, useEffect } from "react"
import { colors } from "../styles/colors"

interface AudioVisualizerProps {
  audioData: Float32Array | null
  type: "input" | "output"
  isRecording?: boolean
}

export function AudioVisualizer({ audioData, type, isRecording = false }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Create gradient (same as before)
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    if (type === "input") {
      gradient.addColorStop(0, "rgba(0, 150, 255, 0.8)")
      gradient.addColorStop(1, "rgba(0, 255, 150, 0.8)")
    } else {
      gradient.addColorStop(0, "rgba(255, 100, 0, 0.8)")
      gradient.addColorStop(1, "rgba(255, 0, 100, 0.8)")
    }

    const NUM_BARS = 200

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      if (audioData) {
        const dataStep = Math.floor(audioData.length / NUM_BARS)
        const barWidth = width / NUM_BARS
        const averages: number[] = []

        // First pass: calculate averages for all bins
        for (let i = 0; i < NUM_BARS; i++) {
          const dataStart = i * dataStep
          const dataEnd = dataStart + dataStep
          const slice = audioData.slice(dataStart, dataEnd)
          const sum = slice.reduce((acc, val) => acc + Math.abs(val), 0)
          averages.push(sum / slice.length)
        }

        // Find maximum average to normalize against
        const maxAverage = Math.max(...averages) || 1 // Prevent division by zero

        // Second pass: draw bars
        for (let i = 0; i < NUM_BARS; i++) {
          const normalizedHeight = (averages[i] / maxAverage) * height
          const barHeight = Math.max(normalizedHeight, 1) // Ensure at least 1px for visibility
          
          const x = i * barWidth
          const y = (height - barHeight) / 2

          ctx.fillStyle = gradient
          ctx.fillRect(x, y, barWidth - 1, barHeight)
        }
      } else {
        // Draw flat line when no data (same as before)
        ctx.beginPath()
        ctx.moveTo(0, height / 2)
        ctx.lineTo(width, height / 2)
        ctx.strokeStyle = gradient
        ctx.stroke()
      }

      animationFrameId.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [audioData, type])

  // The rest of the component remains the same
  return (
    <div
      className={`w-full h-full ${colors.background.white} ${colors.shadow} rounded-lg overflow-hidden p-2 relative`}
    >
      <div
        className={`
          absolute top-2 left-2 z-10 
          px-2 py-1 
          rounded-md 
          shadow-md 
          ${colors.background.panel} 
          ${colors.text.secondary}
        `}
      >
        <h2 className="text-sm font-semibold">{type === "input" ? "Input" : "Output"}</h2>
        {isRecording && type === "input" && (
          <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>
      <canvas ref={canvasRef} width={600} height={200} className="w-full h-full" />
    </div>
  )
}

