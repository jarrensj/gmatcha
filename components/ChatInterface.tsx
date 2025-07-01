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
      <Button 
        onClick={() => setIsOpen(true)} 
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full p-0 shadow-soft bg-[hsl(var(--charcoal))] hover:bg-[hsl(var(--charcoal-light))] text-[hsl(var(--cream))] border-2 border-[hsl(var(--border))]"
      >
        <MessageSquare className="h-7 w-7" />
      </Button>
    )
  }

  return (
    <Card
      className={cn(
        "fixed right-6 transition-all duration-300 shadow-soft flex flex-col overflow-hidden sketch-border bg-[hsl(var(--card))]",
        isMinimized ? "bottom-6 h-16 w-16 rounded-full p-0 cursor-pointer" : "bottom-6 h-[450px] w-80 max-h-[80vh]",
      )}
    >
      {/* Chat Header */}
      <div 
        className={cn(
          "flex items-center justify-between cursor-pointer flex-shrink-0",
          isMinimized ? "h-full w-full rounded-full" : "p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--cream-dark))]"
        )}
        onClick={(e) => {
          e.stopPropagation();
          setIsMinimized(!isMinimized);
        }}
      >
        {isMinimized ? (
          <div className="h-full w-full flex items-center justify-center">
            <MessageSquare className="h-7 w-7 text-[hsl(var(--charcoal))]" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-[hsl(var(--charcoal))]" />
              <h3 className="text-lg font-light text-[hsl(var(--charcoal))] tracking-wide">AI Assistant</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--charcoal-light))] hover:text-[hsl(var(--charcoal))] hover:bg-[hsl(var(--matcha-subtle))]" onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}>
                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--charcoal-light))] hover:text-[hsl(var(--charcoal))] hover:bg-[hsl(var(--matcha-subtle))]" onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Chat Content - only visible when not minimized */}
      {!isMinimized && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-4">
                <div className="sketch-border p-3 bg-[hsl(var(--matcha-subtle))] inline-block">
                  <p className="text-[hsl(var(--charcoal-light))] font-light tracking-wide text-sm leading-relaxed">
                    Hello! How can I help you today? Please select one of the options below.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[85%] p-3 sketch-border text-sm",
                      message.role === 'user' 
                        ? "bg-[hsl(var(--charcoal))] text-[hsl(var(--cream))] ml-auto" 
                        : "bg-[hsl(var(--matcha-subtle))] text-[hsl(var(--charcoal))] mr-auto"
                    )}
                  >
                    <p className="whitespace-pre-wrap font-light leading-relaxed tracking-wide">{message.content}</p>
                    <div className="text-xs mt-2 opacity-70 font-light">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Options Area */}
          <div className="p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--cream-dark))]">
            {messages.length === 0 ? (
              <div className="space-y-2">
                {examplePrompts.map((prompt, index) => (
                  <button 
                    key={index}
                    className="w-full text-left p-3 sketch-border bg-[hsl(var(--card))] hover:bg-[hsl(var(--matcha-subtle))] transition-colors focus-zen text-sm"
                    onClick={() => handleSubmit(prompt.text, index)}
                    disabled={isLoading}
                  >
                    <div className="w-full">
                      {loadingPromptIndex === index ? (
                        <div className="flex items-center gap-2">
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                          <span className="font-light tracking-wide">Processing...</span>
                        </div>
                      ) : (
                        <>
                          <p className="font-light text-[hsl(var(--charcoal))] tracking-wide">{prompt.text}</p>
                          <p className="text-xs text-[hsl(var(--charcoal-light))] mt-1 font-light">{prompt.description}</p>
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-center text-xs text-[hsl(var(--charcoal-light))] font-light tracking-wide">Try another option:</p>
                <div className="flex flex-wrap gap-1.5">
                  {examplePrompts.map((prompt, index) => (
                    <button 
                      key={index}
                      className="px-2 py-1.5 text-xs sketch-border bg-[hsl(var(--card))] hover:bg-[hsl(var(--matcha-subtle))] text-[hsl(var(--charcoal))] transition-colors focus-zen font-light tracking-wide"
                      onClick={() => handleSubmit(prompt.text, index)}
                      disabled={isLoading}
                    >
                      {loadingPromptIndex === index ? (
                        <Loader2Icon className="h-3 w-3 animate-spin" />
                      ) : (
                        prompt.text
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
} 