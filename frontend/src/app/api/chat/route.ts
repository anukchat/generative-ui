import { NextRequest, NextResponse } from 'next/server'

// Define the API route handler for chat
export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json()
    const { messages } = body

    // Forward the request to the backend
    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    })

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.detail || 'Failed to get response from backend' },
        { status: response.status }
      )
    }

    // Get the response data
    const data = await response.json()

    // Return the response
    return NextResponse.json({
      role: data.message.role,
      content: data.message.content,
      ...(data.message.tool_calls && { tool_calls: data.message.tool_calls }),
    })
  } catch (error) {
    console.error('Error in chat API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
