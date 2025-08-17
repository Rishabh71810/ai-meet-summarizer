import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

export async function POST(req: NextRequest) {
  try {
    const { transcript, prompt } = await req.json()

    if (!transcript || !prompt) {
      return NextResponse.json(
        { error: 'Transcript and prompt are required' },
        { status: 400 }
      )
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes meeting transcripts based on user instructions. Provide clear, concise, and well-structured summaries.',
        },
        {
          role: 'user',
          content: `${prompt}\n\nTranscript:\n${transcript}`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 2048,
    })

    const summary = completion.choices[0]?.message?.content || 'Unable to generate summary'

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary. Please check your API key and try again.' },
      { status: 500 }
    )
  }
}