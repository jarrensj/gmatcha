'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2Icon, MessageSquare, ChevronUp, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(true)
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

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 rounded-full p-3 shadow-lg">
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card
      className={cn(
        "fixed right-4 transition-all duration-300 shadow-lg flex flex-col",
        isMinimized ? "bottom-4 h-14 w-80" : "bottom-4 h-[500px] w-80 max-h-[80vh]",
      )}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Content - only visible when not minimized */}
      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-6">
                <p className="mb-4">Select one of these options to analyze your standup updates:</p>
                <div className="grid grid-cols-1 gap-2">
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
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[80%] p-3 rounded-lg",
                      message.role === 'user' 
                        ? "bg-primary text-primary-foreground ml-auto" 
                        : "bg-muted mr-auto"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
                <div className="w-full">
                  <p className="text-center text-sm text-muted-foreground mb-3">Try another option:</p>
                  <div className="grid grid-cols-1 gap-2">
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
                </div>
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </>
      )}
    </Card>
  )
} 