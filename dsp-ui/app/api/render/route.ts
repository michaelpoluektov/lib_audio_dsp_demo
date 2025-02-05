import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { API_BASE_URL } from "../constants"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/graph/render`, {
      method: "POST",
      headers: {
        Accept: "image/svg+xml",
      },
      cache: "no-store",
    })
    if (!response.ok) {
      throw new Error("Failed to fetch SVG")
    }
    const svgContent = await response.text()
    const modifiedSvgContent = modifySvgContent(svgContent)
    return new NextResponse(modifiedSvgContent, {
      headers: { "Content-Type": "image/svg+xml" },
    })
  } catch (error) {
    console.warn("Warning: Failed to fetch SVG. Using fallback sample SVG.", error)
    // Fallback to sample SVG
    const samplePath = path.join(process.cwd(), "public", "samples", "sample_graph.svg")
    const sampleSvg = fs.readFileSync(samplePath, "utf8")
    const modifiedSampleSvg = modifySvgContent(sampleSvg)
    return new NextResponse(modifiedSampleSvg, {
      headers: { "Content-Type": "image/svg+xml" },
    })
  }
}

function modifySvgContent(svgContent: string): string {
  // Remove the white background
  return svgContent.replace('<polygon fill="white" stroke="none"', '<polygon fill="none" stroke="none"')
}

