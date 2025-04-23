import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || ""

async function createClerkSupabaseClient(req: NextRequest) {
  return createClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      const { getToken } = getAuth(req)
      const token = await getToken()
      return token || ''
    },
  })
}

function getDateRangeFromQuery(query: string): { startDate: string | null; endDate: string | null } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let startDate: Date | null = null
  let endDate: Date | null = today
  
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('yesterday')) {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    startDate = yesterday
    endDate = yesterday
  } 
  else if (lowerQuery.includes('last week') || lowerQuery.includes('past week')) {
    const lastWeekStart = new Date(today)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)
    startDate = lastWeekStart
  } 
  else if (lowerQuery.includes('last month') || lowerQuery.includes('past month')) {
    const lastMonthStart = new Date(today)
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
    startDate = lastMonthStart
  } 
  else if (lowerQuery.includes('this quarter') || lowerQuery.includes('current quarter')) {
    const currentMonth = today.getMonth()
    const quarterStartMonth = Math.floor(currentMonth / 3) * 3
    startDate = new Date(today.getFullYear(), quarterStartMonth, 1)
  } 
  else if (lowerQuery.includes('last quarter') || lowerQuery.includes('previous quarter')) {
    const currentMonth = today.getMonth()
    const previousQuarterStartMonth = Math.floor((currentMonth - 3) / 3) * 3
    startDate = new Date(today.getFullYear(), previousQuarterStartMonth, 1)
    
    const quarterEndMonth = previousQuarterStartMonth + 2
    const quarterEndDate = new Date(today.getFullYear(), quarterEndMonth + 1, 0)
    endDate = quarterEndDate
  } 
  else if (lowerQuery.includes('this year') || lowerQuery.includes('current year')) {
    startDate = new Date(today.getFullYear(), 0, 1)
  } 
  else if (lowerQuery.includes('last year') || lowerQuery.includes('previous year')) {
    startDate = new Date(today.getFullYear() - 1, 0, 1)
    endDate = new Date(today.getFullYear() - 1, 11, 31)
  }
  else {
    startDate = null
  }
  
  const formatDate = (date: Date | null): string | null => {
    if (!date) return null
    return date.toISOString().split('T')[0]
  }
  
  return { 
    startDate: formatDate(startDate), 
    endDate: formatDate(endDate) 
  }
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { message } = body
    
    if (!message) {
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 }
      )
    }

    const { startDate, endDate } = getDateRangeFromQuery(message)

    const supabase = await createClerkSupabaseClient(req)
    let query = supabase
      .from('standupupdates')
      .select('id, text, date, created_at, updated_at, user_id')
      .eq('user_id', userId)
      
    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }
    
    const { data: updates, error } = await query.order('date', { ascending: false })
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch updates' },
        { status: 500 }
      )
    }

    let dateRangeInfo = ""
    if (startDate && endDate && startDate === endDate) {
      dateRangeInfo = `for ${startDate}`
    } else if (startDate && endDate) {
      dateRangeInfo = `from ${startDate} to ${endDate}`
    } else if (startDate) {
      dateRangeInfo = `since ${startDate}`
    } else if (endDate) {
      dateRangeInfo = `until ${endDate}`
    } else {
      dateRangeInfo = `from all time`
    }

    if (updates.length === 0) {
      return NextResponse.json({ 
        response: `I couldn't find any standup updates ${dateRangeInfo}. Try asking about a different time period or check if you have any updates recorded.` 
      })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an AI assistant that helps users analyze their standup updates. " +
            "Answer questions about their work history, summarize accomplishments, " +
            "identify trends, and extract insights from their updates. " +
            "When responding, make reference to specific dates and items from their updates to provide context. " + 
            "Be concise but thorough, and focus on providing actionable insights."
        },
        {
          role: "user",
          content: `Here are my standup updates ${dateRangeInfo} (${updates.length} updates total): 
                   ${JSON.stringify(updates, null, 2)}. 
                   
                   My question is: ${message}`
        }
      ],
    })

    const aiResponse = completion.choices[0].message.content || "Sorry, I couldn't process your request."

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error('Error processing chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 