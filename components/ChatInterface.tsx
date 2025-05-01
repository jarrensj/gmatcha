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
      <Button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 rounded-full p-3 shadow-lg">
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card
      className={cn(
        "fixed right-4 transition-all duration-300 shadow-lg flex flex-col",
        isMinimized ? "bottom-4 h-14 w-80" : "bottom-4 h-[400px] w-80 max-h-[80vh]",
      )}
    >
      <div 
        className={cn(
          "flex flex-col h-full",
          isMinimized && "cursor-pointer"
        )}
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-2 border-b" onClick={(e) => {
          if (!isMinimized) {
            e.stopPropagation();
            setIsMinimized(true);
          }
        }}>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <h3 className="text-sm font-medium">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}>
              {isMinimized ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Chat Content - only visible when not minimized */}
        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {messages.length === 0 ? (
                <div className="text-muted-foreground">
                  <div className="bg-muted p-2 rounded-lg text-sm max-w-[80%] mr-auto">
                    Hello! How can I help you today? Please select one of the options below.
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-[80%] p-2 rounded-lg text-sm",
                        message.role === 'user' 
                          ? "bg-primary text-primary-foreground ml-auto" 
                          : "bg-muted mr-auto"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="text-[10px] mt-1 opacity-70">
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
            <div className="p-2 border-t">
              {messages.length === 0 ? (
                <div className="grid grid-cols-1 gap-1.5">
                  {examplePrompts.map((prompt, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      className="justify-start text-left h-auto py-1.5 px-3 text-sm"
                      onClick={() => handleSubmit(prompt.text, index)}
                      disabled={isLoading}
                    >
                      <div className="w-full overflow-hidden">
                        {loadingPromptIndex === index ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <p className="font-medium">{prompt.text}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{prompt.description}</p>
                          </>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-center text-xs text-muted-foreground">Try another option:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {examplePrompts.map((prompt, index) => (
                      <Button 
                        key={index}
                        variant="outline" 
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleSubmit(prompt.text, index)}
                        disabled={isLoading}
                      >
                        {loadingPromptIndex === index ? (
                          <Loader2Icon className="h-3 w-3 animate-spin" />
                        ) : (
                          prompt.text
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  )
} 