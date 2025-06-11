import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import OpenAI from "openai"
import { createClerkSupabaseClient } from "@/app/lib/db"
import { STANDUP_ANALYSIS_PROMPT } from "@/app/lib/prompts/standup-analysis"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function getDateRangeFromDays(days: number): { startDate: string; endDate: string } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - days)
  
  return { 
    startDate: startDate.toISOString().split('T')[0], 
    endDate: today.toISOString().split('T')[0] 
  }
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { message, days } = body
    
    if (!message) {
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 }
      )
    }
    
    if (!days || isNaN(parseInt(days))) {
      return NextResponse.json({ 
        response: "Please specify a valid number of days." 
      })
    }
    
    const daysNum = parseInt(days)
    const { startDate, endDate } = getDateRangeFromDays(daysNum)

    const supabase = await createClerkSupabaseClient(req)
    const { data: updates, error } = await supabase
      .from('standupupdates')
      .select('id, text, date, created_at, updated_at, user_id')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch updates' },
        { status: 500 }
      )
    }

    const dateRangeInfo = `from ${startDate} to ${endDate} (last ${daysNum} days)`

    if (updates.length === 0) {
      return NextResponse.json({ 
        response: `I couldn't find any standup updates in the last ${daysNum} days. Try asking about a different time period or check if you have any updates recorded.` 
      })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: STANDUP_ANALYSIS_PROMPT
        },
        {
          role: "user",
          content: `Here are my standup updates ${dateRangeInfo} (${updates.length} updates total): 
                   ${JSON.stringify(updates, null, 2)}. 
                   
                   Please summarize my accomplishments, priorities, and blockers from these updates.`
        }
      ],
    })

    const aiResponse = completion.choices[0].message.content || "Sorry, I couldn't process your request."
    
    try {
      await supabase
        .from('chat_logs')
        .insert([{
          user_id: userId,
          message: message,
          response: aiResponse,
          context: {
            days: daysNum,
            date_range: { startDate, endDate },
            updates_count: updates.length
          }
        }])
    } catch (logError) {
      console.error('Error logging chat:', logError)
    }

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error('Error processing chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 