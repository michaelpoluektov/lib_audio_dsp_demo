"use client"

import { useState, useEffect, useCallback } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import NodeCard from "./NodeCard"
import { colors } from "../styles/colors"
import debounce from "lodash/debounce"
import { toast } from "@/components/ui/use-toast"
import { GRAPH_PARAMS_ENDPOINT } from "../api/constants"
import { useAudioRegeneration } from "../hooks/useAudioRegeneration"

interface Graph {
  name: string
  nodes: Node[]
}

interface Node {
  op_type: string
  placement: {
    name: string
  }
  config?: Record<string, any>
}

interface NodePanelProps {
  updateTrigger: number
  nodeConfigs: Record<string, Record<string, number | boolean>>
  setNodeConfigs: React.Dispatch<React.SetStateAction<Record<string, Record<string, number | boolean>>>>
}

export default function NodePanel({ updateTrigger, nodeConfigs, setNodeConfigs }: NodePanelProps) {
  // const [nodeConfigs, setNodeConfigs] = useState<Record<string, Record<string, number | boolean>>>({})
  const [graph, setGraph] = useState<Graph | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const { triggerRegeneration } = useAudioRegeneration()

  const debouncedSendConfigs = useCallback(
    debounce(async (configs: Record<string, Record<string, number | boolean>>) => {
      try {
        const response = await fetch(GRAPH_PARAMS_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(configs),
        })

        if (!response.ok) {
          throw new Error("Failed to update node configurations")
        }

        // Trigger audio regeneration after successful config update
        triggerRegeneration()
      } catch (error) {
        console.error("Error updating node configurations:", error)
        toast({
          title: "Error",
          description: "Failed to update node configurations. Please try again.",
          variant: "destructive",
        })
      }
    }, 300),
    [triggerRegeneration],
  )

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch("/api/graph", { cache: "no-store" })
        if (!res.ok) {
          throw new Error("Failed to fetch graph data")
        }
        const data = await res.json()
        setGraph(data)
        setWarning(null)
      } catch (err) {
        console.error("Error fetching graph:", err)
        setWarning("Unable to fetch latest graph data. Displaying sample data.")
      }
    }

    fetchGraph()
  }, [])

  useEffect(() => {
    debouncedSendConfigs(nodeConfigs)
  }, [nodeConfigs, debouncedSendConfigs])

  if (!graph) {
    return <div className="w-full h-full flex items-center justify-center">Loading...</div>
  }

  return (
    <div
      className={`w-full h-full ${colors.background.white} overflow-y-auto border-l ${colors.border} ${colors.shadow} rounded-lg flex flex-col`}
    >
      <div className={`sticky top-0 ${colors.background.panel} border-b ${colors.border} p-4 rounded-t-lg`}>
        <h2 className={`text-xl font-semibold ${colors.text.secondary}`}>Nodes</h2>
        {warning && <p className="text-yellow-500 mt-2 text-sm">{warning}</p>}
      </div>
      <div className="flex-grow overflow-y-auto">
        <Accordion type="single" collapsible className="w-full">
          {graph.nodes.map((node, index) => (
            <AccordionItem key={index} value={`node-${index}`} className={`border-b ${colors.border} last:border-b-0`}>
              <AccordionTrigger className={`px-4 py-3 ${colors.background.hover} ${colors.text.secondary} font-medium`}>
                {node.placement.name}
              </AccordionTrigger>
              <AccordionContent className={`${colors.background.panel} p-4`}>
                <NodeCard
                  key={index}
                  node={node}
                  config={nodeConfigs[node.placement.name] || {}}
                  setNodeConfigs={setNodeConfigs}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}

