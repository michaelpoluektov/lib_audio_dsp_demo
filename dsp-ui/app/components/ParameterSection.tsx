import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

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

interface ParameterSectionProps {
  params: Record<string, ParamSchema>
  paramValues: Record<string, number | boolean>
  onConfigChange: (newValues: Record<string, number | boolean>) => void
}

export function ParameterSection({ params, paramValues, onConfigChange }: ParameterSectionProps) {
  const getMinValue = (schema: ParamSchema) => {
    if (schema.minimum !== undefined) return schema.minimum
    if (schema.exclusiveMinimum !== undefined) return schema.exclusiveMinimum + Number.EPSILON
    return -24
  }

  const getMaxValue = (schema: ParamSchema) => {
    if (schema.maximum !== undefined) return schema.maximum
    if (schema.exclusiveMaximum !== undefined) return schema.exclusiveMaximum - Number.EPSILON
    return 24
  }

  const handleSliderChange = (param: string, value: number[]) => {
    const newValues = { ...paramValues, [param]: value[0] }
    onConfigChange(newValues)
  }

  const handleIntegerInputChange = (param: string, value: string) => {
    const intValue = Number.parseInt(value, 10)
    if (!isNaN(intValue)) {
      const newValues = { ...paramValues, [param]: intValue }
      onConfigChange(newValues)
    }
  }

  const handleToggleChange = (param: string, checked: boolean) => {
    const newValues = { ...paramValues, [param]: checked }
    onConfigChange(newValues)
  }

  return (
    <AccordionItem value="parameters" className="border-b border-gray-100">
      <AccordionTrigger className="px-4 py-2 hover:bg-gray-50 text-gray-700">Parameters</AccordionTrigger>
      <AccordionContent className="bg-gray-50 p-3">
        {Object.entries(params).map(([param, schema]) => {
          if (schema.type === "number") {
            const min = getMinValue(schema)
            const max = getMaxValue(schema)
            const step = (max - min) / 1000 // Increased precision
            return (
              <div key={param} className="mb-4 bg-white p-3 rounded-md shadow-sm">
                <Label htmlFor={param} className="text-sm font-medium text-gray-700">
                  {schema.title}
                </Label>
                <Slider
                  id={param}
                  min={min}
                  max={max}
                  step={step}
                  value={[paramValues[param] as number]}
                  onValueChange={(value) => handleSliderChange(param, value)}
                  className="my-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{min.toFixed(2)}</span>
                  <span>{(paramValues[param] as number).toFixed(2)}</span>
                  <span>{max.toFixed(2)}</span>
                </div>
                {schema.description && <p className="text-xs text-gray-500 mt-1">{schema.description}</p>}
              </div>
            )
          } else if (schema.type === "integer") {
            if (param.toLowerCase().endsWith("state")) {
              return (
                <div key={param} className="flex items-center justify-between mb-4 bg-white p-3 rounded-md shadow-sm">
                  <Label htmlFor={param} className="text-sm font-medium text-gray-700">
                    {schema.title}
                  </Label>
                  <Switch
                    id={param}
                    checked={paramValues[param] as boolean}
                    onCheckedChange={(checked) => handleToggleChange(param, checked)}
                  />
                  {schema.description && <p className="text-xs text-gray-500 mt-1">{schema.description}</p>}
                </div>
              )
            } else {
              return (
                <div key={param} className="mb-4 bg-white p-3 rounded-md shadow-sm">
                  <Label htmlFor={param} className="text-sm font-medium text-gray-700">
                    {schema.title}
                  </Label>
                  <Input
                    id={param}
                    type="number"
                    value={paramValues[param] as number}
                    onChange={(e) => handleIntegerInputChange(param, e.target.value)}
                    className="mt-1 bg-gray-50 border border-gray-200"
                    min={schema.minimum}
                    max={schema.maximum}
                    step={1}
                  />
                  {schema.description && <p className="text-xs text-gray-500 mt-1">{schema.description}</p>}
                </div>
              )
            }
          }
          return null
        })}
      </AccordionContent>
    </AccordionItem>
  )
}

