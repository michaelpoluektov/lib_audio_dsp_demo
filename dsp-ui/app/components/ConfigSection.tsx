import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ConfigSectionProps {
  config: Record<string, number>
}

export function ConfigSection({ config }: ConfigSectionProps) {
  const renderConfigValue = (key: string, value: number) => {
    return (
      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
        <span className="font-medium text-sm text-gray-600">{key}:</span>
        <span className="text-sm text-gray-700">{typeof value === "number" ? value.toFixed(2) : value}</span>
      </div>
    )
  }

  return (
    <AccordionItem value="config" className="border-b border-gray-100">
      <AccordionTrigger className="px-4 py-2 hover:bg-gray-50 text-gray-700">Config</AccordionTrigger>
      <AccordionContent className="bg-gray-50 p-3">
        <div className="bg-white p-3 rounded-md shadow-sm">
          {Object.entries(config).map(([key, value]) => renderConfigValue(key, value))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

