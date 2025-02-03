import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Plus, Minus } from "lucide-react"

interface BiquadFilter {
  type: string
  [key: string]: number | string | undefined
}

interface ParametricEqSectionProps {
  filters: BiquadFilter[]
  onChange: (filters: BiquadFilter[]) => void
}

const biquadTypes = [
  "allpass",
  "bandpass",
  "bandstop",
  "bypass",
  "constant_q",
  "gain",
  "highpass",
  "highshelf",
  "linkwitz",
  "lowpass",
  "lowshelf",
  "notch",
  "peaking",
]

const biquadParams: { [key: string]: string[] } = {
  allpass: ["filter_freq", "q_factor"],
  bandpass: ["filter_freq", "bw"],
  bandstop: ["filter_freq", "bw"],
  bypass: [],
  constant_q: ["filter_freq", "q_factor", "boost_db"],
  gain: ["gain_db"],
  highpass: ["filter_freq", "q_factor"],
  highshelf: ["filter_freq", "q_factor", "boost_db"],
  linkwitz: ["f0", "q0", "fp", "qp"],
  lowpass: ["filter_freq", "q_factor"],
  lowshelf: ["filter_freq", "q_factor", "boost_db"],
  notch: ["filter_freq", "q_factor"],
  peaking: ["filter_freq", "q_factor", "boost_db"],
}

export function ParametricEqSection({ filters, onChange }: ParametricEqSectionProps) {
  const [selectedFilters, setSelectedFilters] = useState<BiquadFilter[]>(filters)

  const addFilter = () => {
    if (selectedFilters.length < 8) {
      const newFilter: BiquadFilter = {
        type: "bypass",
        filter_freq: 500,
        q_factor: 0.707,
        bw: 1,
        boost_db: 0,
        gain_db: 0,
        f0: 500,
        q0: 0.707,
        fp: 1000,
        qp: 0.707,
      }
      setSelectedFilters([...selectedFilters, newFilter])
      onChange([...selectedFilters, newFilter])
    }
  }

  const removeFilter = (index: number) => {
    const newFilters = selectedFilters.filter((_, i) => i !== index)
    setSelectedFilters(newFilters)
    onChange(newFilters)
  }

  const updateFilter = (index: number, key: string, value: string | number) => {
    const newFilters = [...selectedFilters]
    newFilters[index] = { ...newFilters[index], [key]: value ?? 0 }
    setSelectedFilters(newFilters)
    onChange(newFilters)
  }

  const renderFilterParams = (filter: BiquadFilter, index: number) => {
    return biquadParams[filter.type].map((param) => (
      <div key={`${index}-${param}`} className="mb-4">
        <Label htmlFor={`${index}-${param}`} className="text-sm font-medium text-gray-700">
          {param.replace("_", " ").charAt(0).toUpperCase() + param.replace("_", " ").slice(1)}
        </Label>
        <Slider
          id={`${index}-${param}`}
          min={param.includes("freq") ? 20 : -24}
          max={param.includes("freq") ? 20000 : 24}
          step={param.includes("freq") ? 1 : 0.1}
          value={[(filter[param] as number) || 0]}
          onValueChange={(value) => updateFilter(index, param, value[0])}
          className="my-2"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{param.includes("freq") ? "20Hz" : "-24"}</span>
          <span>{((filter[param] as number) || 0).toFixed(1)}</span>
          <span>{param.includes("freq") ? "20kHz" : "24"}</span>
        </div>
      </div>
    ))
  }

  return (
    <div className="space-y-4">
      {selectedFilters.map((filter, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <Select value={filter.type} onValueChange={(value) => updateFilter(index, "type", value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select filter type" />
              </SelectTrigger>
              <SelectContent>
                {biquadTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="destructive" size="icon" onClick={() => removeFilter(index)}>
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          {renderFilterParams(filter, index)}
        </div>
      ))}
      {selectedFilters.length < 8 && (
        <Button onClick={addFilter} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Filter
        </Button>
      )}
    </div>
  )
}

