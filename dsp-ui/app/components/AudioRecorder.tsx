"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"
import { WaveFile } from "wavefile"

interface AudioRecorderProps {
  channelCount: number
  sampleRate: number
  onRecordingComplete: (wavBlob: Blob, audioData: Float32Array) => void
  onDataAvailable: (audioData: Float32Array) => void
  onRecordingStateChange: (isRecording: boolean) => void
}

export function AudioRecorder({
  channelCount,
  sampleRate,
  onRecordingComplete,
  onDataAvailable,
  onRecordingStateChange,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const analyserNodeRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Float32Array | null>(null)
  const accumulatedBufferRef = useRef<Float32Array>(new Float32Array())
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount, sampleRate },
      })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []
      accumulatedBufferRef.current = new Float32Array()

      audioContextRef.current = new AudioContext({ sampleRate })
      sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream)
      analyserNodeRef.current = audioContextRef.current.createAnalyser()
      analyserNodeRef.current.fftSize = 2048
      sourceNodeRef.current.connect(analyserNodeRef.current)

      const bufferLength = analyserNodeRef.current.frequencyBinCount
      dataArrayRef.current = new Float32Array(bufferLength)

      const updateAudioData = () => {
        if (analyserNodeRef.current && dataArrayRef.current) {
          analyserNodeRef.current.getFloatTimeDomainData(dataArrayRef.current)

          // Accumulate the new data
          const newBuffer = new Float32Array(accumulatedBufferRef.current.length + dataArrayRef.current.length)
          newBuffer.set(accumulatedBufferRef.current)
          newBuffer.set(dataArrayRef.current, accumulatedBufferRef.current.length)
          accumulatedBufferRef.current = newBuffer

          onDataAvailable(accumulatedBufferRef.current)
        }
        rafIdRef.current = requestAnimationFrame(updateAudioData)
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
        convertToWav(audioBlob)
      }

      mediaRecorderRef.current.start(40) // Collect data every 40ms
      setIsRecording(true)
      onRecordingStateChange(true)
      updateAudioData()
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    onRecordingStateChange(false)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
    }
  }

  const convertToWav = async (audioBlob: Blob) => {
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioContext = new AudioContext({ sampleRate })
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    const wav = new WaveFile()
    const audioData = audioBuffer.getChannelData(0)
    wav.fromScratch(
      channelCount,
      sampleRate,
      "16",
      audioData.map((sample) => sample * 32767),
    )

    const wavBlob = new Blob([wav.toBuffer()], { type: "audio/wav" })
    onRecordingComplete(wavBlob, audioData)
  }

  return (
    <Button onClick={isRecording ? stopRecording : startRecording} variant={isRecording ? "destructive" : "default"}>
      {isRecording ? <Square className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
      {isRecording ? "Stop Recording" : "Start Recording"}
    </Button>
  )
}

