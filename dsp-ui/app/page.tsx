"use client"

import { useState, useEffect } from "react"
import { AudioRecorder } from "./components/AudioRecorder"
import { AudioPlayback } from "./components/AudioPlayback"
import GraphDisplay from "./components/GraphDisplay"
import NodePanel from "./components/NodePanel"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { colors } from "./styles/colors"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { GRAPH_DATA_ENDPOINT, GRAPH_PARAMS_ENDPOINT } from "./api/constants"
import { AudioVisualizer } from "./components/AudioVisualizer"
import { useAudioRegeneration } from "./hooks/useAudioRegeneration"

const SEPARATOR_CLASS = "h-2" // This creates an 8px (0.5rem) gap

export default function Home() {
  const { toast } = useToast()
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const [graphInputs, setGraphInputs] = useState<{ channels: number; fs: number } | null>(null)
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null)
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null)
  const [graphName, setGraphName] = useState<string>("")
  const [inputAudioData, setInputAudioData] = useState<Float32Array | null>(null)
  const [outputAudioData, setOutputAudioData] = useState<Float32Array | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const { regenerateAudio, isRegenerating } = useAudioRegeneration()
  const [inputAudioBlob, setInputAudioBlob] = useState<Blob | null>(null)
  const [nodeConfigs, setNodeConfigs] = useState<Record<string, Record<string, number | boolean>>>({}) // Updated state for node configurations

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const res = await fetch(GRAPH_DATA_ENDPOINT, { cache: "no-store" })
        if (!res.ok) {
          throw new Error("Failed to fetch graph data")
        }
        const data = await res.json()
        setGraphInputs(data.input)
        setGraphName(data.name || "Untitled Graph")
      } catch (err) {
        console.error("Error fetching graph data:", err)
        toast({
          title: "Error",
          description: "Failed to fetch graph data. Please try again later.",
          variant: "destructive",
        })
      }
    }

    fetchGraphData()
  }, [toast])

  useEffect(() => {
    const handleRegeneration = async () => {
      if (inputAudioBlob) {
        const result = await regenerateAudio(inputAudioBlob)
        if (result) {
          const { processedUrl, processedAudioData } = result
          setProcessedAudioUrl(processedUrl)
          setOutputAudioData(processedAudioData)
        }
      }
    }

    window.addEventListener("regenerateAudio", handleRegeneration)
    return () => {
      window.removeEventListener("regenerateAudio", handleRegeneration)
    }
  }, [inputAudioBlob, regenerateAudio])

  const handleUpdate = () => {
    setUpdateTrigger((prev) => prev + 1)
  }

  const handleReload = async () => {
    try {
      const response = await fetch(GRAPH_PARAMS_ENDPOINT)
      if (!response.ok) {
        throw new Error("Failed to fetch graph parameters")
      }
      const data = await response.json()
      setNodeConfigs(data)
      toast({
        title: "Graph Reloaded",
        description: "Graph parameters have been updated.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error reloading graph:", error)
      toast({
        title: "Error",
        description: "Failed to reload graph parameters. Please try again.",
        variant: "destructive",
      })
    }
  }

  const onRecordingComplete = async (wavBlob: Blob, audioData: Float32Array) => {
    const recordedUrl = URL.createObjectURL(wavBlob)
    setRecordedAudioUrl(recordedUrl)
    setInputAudioData(audioData)
    setInputAudioBlob(wavBlob)

    if (graphInputs) {
      const result = await regenerateAudio(wavBlob)
      if (result) {
        const { processedUrl, processedAudioData } = result
        setProcessedAudioUrl(processedUrl)
        setOutputAudioData(processedAudioData)
      }
    } else {
      // If no graph is set, use the input audio for the output
      setOutputAudioData(audioData)
      setProcessedAudioUrl(recordedUrl)
      toast({
        title: "Recording Completed",
        description: "No graph available for processing. Original audio used for both input and output.",
        variant: "default",
      })
    }
  }

  const onDataAvailable = (audioData: Float32Array) => {
    setInputAudioData(audioData)
  }

  const handleRecordingStateChange = (isRecording: boolean) => {
    setIsRecording(isRecording)
    if (isRecording) {
      // Clear the output when starting a new recording
      setOutputAudioData(null)
      setProcessedAudioUrl(null)
    }
  }

  return (
    <main className={`h-screen ${colors.background.main} flex flex-col`}>
      {/* Top container for audio controls */}
      <div className={`${colors.background.white} ${colors.shadow} p-4 flex justify-between items-center`}>
        <div className="flex space-x-2">
          <AudioRecorder
            channelCount={1}
            sampleRate={graphInputs?.fs ?? 44100}
            onRecordingComplete={onRecordingComplete}
            onDataAvailable={onDataAvailable}
            onRecordingStateChange={handleRecordingStateChange}
          />
          <AudioPlayback
            processedAudioUrl={processedAudioUrl}
            recordedAudioUrl={recordedAudioUrl}
            isRegenerating={isRegenerating}
          />
        </div>
        <div className="flex-grow" />
        <h1 className={`text-xl font-semibold ${colors.text.primary}`}>{graphName || "No Graph Loaded"}</h1>
      </div>

      <div className={SEPARATOR_CLASS} />

      {/* Audio Visualizers */}
      <div className="px-4 flex flex-col space-y-2">
        <div className="w-full h-20">
          <AudioVisualizer audioData={inputAudioData} type="input" isRecording={isRecording} />
        </div>
        <div className="w-full h-20">
          <AudioVisualizer audioData={outputAudioData} type="output" />
        </div>
      </div>

      <div className={SEPARATOR_CLASS} />

      {/* Main content area */}
      <div className="flex-grow flex relative px-4 overflow-hidden">
        <div className="flex-grow pr-2 h-full">
          <div className="relative h-full">
            <GraphDisplay updateTrigger={updateTrigger} onUpdate={handleUpdate} onReload={handleReload} />
          </div>
        </div>
        <div
          className={`transition-all duration-300 ease-in-out ${isPanelOpen ? "w-96" : "w-0"} overflow-hidden h-full`}
        >
          <NodePanel updateTrigger={updateTrigger} nodeConfigs={nodeConfigs} setNodeConfigs={setNodeConfigs} />
        </div>
        <Button
          variant="outline"
          size="icon"
          className={`absolute top-4 right-4 z-10 ${colors.background.white} ${colors.background.hover} rounded-full ${colors.shadow}`}
          onClick={() => setIsPanelOpen(!isPanelOpen)}
        >
          {isPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <Toaster />
    </main>
  )
}

