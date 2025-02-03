import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { GRAPH_DATA_ENDPOINT } from "../constants"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const response = await fetch(GRAPH_DATA_ENDPOINT, { cache: "no-store" })
    if (!response.ok) {
      throw new Error("Failed to fetch graph data")
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.warn("Warning: Failed to fetch graph data. Using fallback sample data.", error)
    // Fallback to sample data
    const samplePath = path.join(process.cwd(), "public", "samples", "sample_graph.json")
    const sampleData = JSON.parse(fs.readFileSync(samplePath, "utf8"))
    return NextResponse.json(sampleData)
  }
}

