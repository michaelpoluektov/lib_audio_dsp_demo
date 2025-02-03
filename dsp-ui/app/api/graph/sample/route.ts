import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  const samplePath = path.join(process.cwd(), "public", "samples", "sample_graph.json")
  const sampleData = JSON.parse(fs.readFileSync(samplePath, "utf8"))
  return NextResponse.json(sampleData)
}

