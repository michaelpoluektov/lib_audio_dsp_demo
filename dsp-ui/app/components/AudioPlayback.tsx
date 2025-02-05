"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"

interface AudioPlaybackProps {
  processedAudioUrl: string | null
  recordedAudioUrl: string | null
  isRegenerating: boolean
}

export function AudioPlayback({ processedAudioUrl, recordedAudioUrl, isRegenerating }: AudioPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    setCurrentAudioUrl(processedAudioUrl || recordedAudioUrl)
  }, [processedAudioUrl, recordedAudioUrl])

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <>
      <Button onClick={togglePlayback} disabled={!currentAudioUrl || isRegenerating}>
        {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
        {isPlaying ? "Pause" : isRegenerating ? "Regenerating..." : "Play"}
      </Button>
      {currentAudioUrl && <audio ref={audioRef} src={currentAudioUrl} onEnded={() => setIsPlaying(false)} />}
    </>
  )
}

