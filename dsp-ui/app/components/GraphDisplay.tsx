"use client"

import { useState, useEffect, useRef } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { colors } from "../styles/colors"
import { ZoomInIcon } from "./icons/ZoomInIcon"
import { ZoomOutIcon } from "./icons/ZoomOutIcon"
import { ResetZoomIcon } from "./icons/ResetZoomIcon"
import { RefreshCw } from "lucide-react"

interface GraphDisplayProps {
  updateTrigger: number
  onReload: () => void
}

export default function GraphDisplay({ updateTrigger, onReload }: GraphDisplayProps) {
  const [svgContent, setSvgContent] = useState<string>("")
  const [warning, setWarning] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch("/api/render", { cache: "no-store" })
        if (!res.ok) {
          throw new Error("Failed to fetch graph")
        }
        const data = await res.text()
        setSvgContent(data)
        setWarning(null)
      } catch (err) {
        console.error("Error fetching graph:", err)
        setWarning("Unable to fetch latest graph. Displaying sample data.")
      }
    }

    fetchGraph()
  }, [])

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${colors.background.white} rounded-lg ${colors.shadow} flex flex-col items-center justify-center overflow-hidden relative`}
    >
      {warning && <p className="text-yellow-500 mb-2 absolute top-2 left-2 z-20">{warning}</p>}
      <button
        onClick={onReload}
        className={`absolute top-2 right-2 z-10 ${colors.background.white} p-2 rounded-full ${colors.shadow} ${colors.background.hover} focus:outline-none ${colors.focus} transition-all duration-200 ease-in-out`}
        aria-label="Reload Graph"
      >
        <RefreshCw className={`h-5 w-5 ${colors.text.tertiary}`} />
      </button>
      {svgContent ? (
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={5}
          limitToBounds={false}
          centerOnInit={true}
          wheel={{ step: 0.1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute top-2 left-2 z-10 flex space-x-1">
                <button
                  onClick={() => zoomIn()}
                  className={`${colors.background.white} p-2 rounded-full ${colors.shadow} ${colors.background.hover} focus:outline-none ${colors.focus} transition-all duration-200 ease-in-out`}
                  aria-label="Zoom in"
                >
                  <ZoomInIcon />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className={`${colors.background.white} p-2 rounded-full ${colors.shadow} ${colors.background.hover} focus:outline-none ${colors.focus} transition-all duration-200 ease-in-out`}
                  aria-label="Zoom out"
                >
                  <ZoomOutIcon />
                </button>
                <button
                  onClick={() => resetTransform()}
                  className={`${colors.background.white} p-2 rounded-full ${colors.shadow} ${colors.background.hover} focus:outline-none ${colors.focus} transition-all duration-200 ease-in-out`}
                  aria-label="Reset zoom"
                >
                  <ResetZoomIcon />
                </button>
              </div>
              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="w-full h-full flex items-center justify-center relative">
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, transparent 70%, white 100%)",
                      zIndex: 1,
                    }}
                  ></div>
                  <div
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      ) : (
        <p className={colors.text.light}>Loading graph...</p>
      )}
    </div>
  )
}

