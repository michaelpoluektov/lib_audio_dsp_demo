import { useState, useEffect } from "react"
import { Accordion } from "@/components/ui/accordion"
import { ConfigSection } from "./ConfigSection"
import { ParameterSection } from "./ParameterSection"
import { ParametricEqSection } from "./ParametricEqSection"

interface NodeProps {
  node: {
    op_type: string
    placement: {
      name: string
    }
    config?: Record<string, number>
  }
  config: Record<string, number | boolean>
  setNodeConfigs: React.Dispatch<React.SetStateAction<Record<string, Record<string, number | boolean>>>>
}

interface ParamSchema {
  type: string
  default?: number
  minimum?: number
  maximum?: number
  exclusiveMinimum?: number
  exclusiveMaximum?: number
  description?: string
  title: string
}

export default function NodeCard({ node, config, setNodeConfigs }: NodeProps) {
  const [params, setParams] = useState<Record<string, ParamSchema>>({})
  const [paramValues, setParamValues] = useState<Record<string, number | boolean>>(config)

  useEffect(() => {
    fetch("/api/params")
      .then((res) => res.json())
      .then((data) => {
        if (data[node.op_type] && node.op_type !== "ParametricEq") {
          setParams(data[node.op_type].properties || {})
          const initialValues: Record<string, number | boolean> = {}
          Object.entries(data[node.op_type].properties || {}).forEach(([key, value]: [string, ParamSchema]) => {
            if (value.type === "number") {
              initialValues[key] = config[key] ?? value.default ?? 0
            } else if (value.type === "integer") {
              if (key.toLowerCase().endsWith("state")) {
                initialValues[key] = config[key] ?? value.default === 1
              } else {
                initialValues[key] = config[key] ?? value.default ?? 0
              }
            }
          })
          setParamValues(initialValues)
        } else if (node.op_type === "ParametricEq") {
          setParams(data[node.op_type].properties || {})
          const initialFilters = config.filters || []
          setParamValues({ filters: initialFilters })
        }
      })
  }, [node.op_type, config])

  const handleConfigChange = (newValues: Record<string, number | boolean>) => {
    setParamValues(newValues)
    setNodeConfigs((prev) => ({
      ...prev,
      [node.placement.name]: newValues,
    }))
  }

  return (
    <div className="bg-white rounded-md shadow-sm">
      <p className="text-sm text-gray-600 mb-2 p-3 bg-gray-50 rounded-t-md">Type: {node.op_type}</p>
      {node.op_type === "ParametricEq" ? (
        <ParametricEqSection
          filters={paramValues.filters || []}
          onChange={(newFilters) => handleConfigChange({ filters: newFilters })}
        />
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {node.config && Object.keys(node.config).length > 0 && <ConfigSection config={node.config} />}
          {node.op_type !== "ParametricEq" && Object.keys(params).length > 0 && (
            <ParameterSection params={params} paramValues={paramValues} onConfigChange={handleConfigChange} />
          )}
        </Accordion>
      )}
    </div>
  )
}

