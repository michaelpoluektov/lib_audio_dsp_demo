import { toast } from "@/components/ui/use-toast"
import { GRAPH_AUDIO_ENDPOINT } from "../api/constants"

export const handleRecordingComplete = async (wavBlob: Blob): Promise<string | null> => {
  try {
    const formData = new FormData()
    formData.append("file", wavBlob, "recording.wav")

    const response = await fetch(GRAPH_AUDIO_ENDPOINT, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
    }

    const processedAudioBlob = await response.blob()
    const processedAudioUrl = URL.createObjectURL(processedAudioBlob)

    toast({
      title: "Audio Processed",
      description: "The audio has been successfully processed and is ready for playback.",
      variant: "default",
    })

    return processedAudioUrl
  } catch (error) {
    console.error("Error processing audio:", error)
    toast({
      title: "Error processing audio",
      description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
      variant: "destructive",
    })
    return null
  }
}

