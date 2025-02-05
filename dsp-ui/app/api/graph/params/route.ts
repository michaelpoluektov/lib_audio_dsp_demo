import { NextResponse } from "next/server"
import { API_BASE_URL } from "../../constants"

export async function POST(request: Request) {
  const parameters = await request.json()
  console.log("Received parameters in API route:", parameters)

  try {
    const response = await fetch(`${API_BASE_URL}/graph/params`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parameters),
    })

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
    }

    console.log("Successfully sent parameters to the server")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating graph parameters:", error)
    return NextResponse.json({ success: false, error: "Failed to update graph parameters" }, { status: 500 })
  }
}

