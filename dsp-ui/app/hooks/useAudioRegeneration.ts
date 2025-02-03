import { useState, useCallback } from "react"
import { GRAPH_AUDIO_ENDPOINT } from "../api/constants"
import { useToast } from "@/components/ui/use-toast"

export function useAudioRegeneration() {
  const [isRegenerating, setIsRegenerating] = useState(false)
  const { toast } = useToast()

  const regenerateAudio = useCallback(
    async (inputAudioBlob: Blob) => {
      if (isRegenerating) return

      setIsRegenerating(true)
      try {
        const formData = new FormData()
        formData.append("file", inputAudioBlob, "input.wav")

        const response = await fetch(GRAPH_AUDIO_ENDPOINT, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
        }

        const processedAudioBlob = await response.blob()
        const processedUrl = URL.createObjectURL(processedAudioBlob)

        // Convert the processed audio blob to Float32Array for visualization
        const arrayBuffer = await processedAudioBlob.arrayBuffer()
        const audioContext = new AudioContext()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        const processedAudioData = audioBuffer.getChannelData(0)

        return { processedUrl, processedAudioData }
      } catch (error) {
        console.error("Error regenerating audio:", error)
        toast({
          title: "Error regenerating audio",
          description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
        return null
      } finally {
        setIsRegenerating(false)
      }
    },
    [isRegenerating, toast],
  )

  const triggerRegeneration = useCallback(() => {
    // This function will be called from the NodePanel
    // It should trigger the regeneration process in the Home component
    // We'll implement a custom event for this
    const event = new CustomEvent("regenerateAudio")
    window.dispatchEvent(event)
  }, [])

  return { regenerateAudio, isRegenerating, triggerRegeneration }
}

