'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2Icon } from "lucide-react"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ExamplePrompt {
  text: string
  description: string
  days: number
}

export default function ChatInterface() {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPromptIndex, setLoadingPromptIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isInitialRender, setIsInitialRender] = useState(true)

  const examplePrompts: ExamplePrompt[] = [
    { 
      text: "Summarize last 7 days", 
      description: "Get a summary of your recent work",
      days: 7
    },
    { 
      text: "Summarize last 30 days", 
      description: "View updates from the past month",
      days: 30 
    },
    { 
      text: "Summarize last 90 days", 
      description: "Review your quarterly activity",
      days: 90
    },
    { 
      text: "Summarize last 365 days", 
      description: "See your progress over the past year",
      days: 365
    }
  ]

  useEffect(() => {
    setIsInitialRender(false)
  }, [])

  useEffect(() => {
    if (!isInitialRender && messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, isInitialRender])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (promptText: string, promptIndex: number) => {
    if (!promptText.trim() || !user || isLoading) return
    
    const selectedPrompt = examplePrompts[promptIndex]
    
    setLoadingPromptIndex(promptIndex)
    setIsLoading(true)
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: promptText,
          userId: user.id,
          days: selectedPrompt.days
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to get response')
      }
      
      const data = await response.json()
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setLoadingPromptIndex(null)
    }
  }

  const renderExamplePromptButtons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {examplePrompts.map((prompt, index) => (
        <Button 
          key={index}
          variant="outline" 
          className="h-auto py-2 px-3 w-full flex flex-col items-center justify-center"
          onClick={() => handleSubmit(prompt.text, index)}
          disabled={isLoading}
        >
          <div className="w-full overflow-hidden text-center">
            {loadingPromptIndex === index ? (
              <Loader2Icon className="h-5 w-5 animate-spin mx-auto" />
            ) : (
              <>
                <p className="font-medium text-sm break-words line-clamp-2">{prompt.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{prompt.description}</p>
              </>
            )}
          </div>
        </Button>
      ))}
    </div>
  )

  const renderPromptInputArea = () => (
    <div className="mt-4 border-t pt-4">
      <div className="flex-1">
        <Textarea
          placeholder="Ask about your standup updates..."
          value=""
          disabled={true}
          className="min-h-[60px] opacity-50 bg-muted"
        />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Please use one of the predefined options above to query your updates
        </p>
      </div>
    </div>
  )

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="border-b pb-3">
        <h2 className="text-xl font-semibold">AI Assistant</h2>
      </CardHeader>
      <CardContent className="flex flex-col h-[400px]">
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              <p className="mb-4">Select one of these options to analyze your standup updates:</p>
              
              <div className="w-full max-w-2xl mx-auto px-2">
                {renderExamplePromptButtons()}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div className="w-full max-w-2xl mx-auto px-2 mt-6">
                <p className="text-center text-sm text-muted-foreground mb-3">Try another option:</p>
                {renderExamplePromptButtons()}
              </div>
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {renderPromptInputArea()}
      </CardContent>
    </Card>
  )
} 