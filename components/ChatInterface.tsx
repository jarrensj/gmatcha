'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SendIcon, Loader2Icon, LightbulbIcon } from "lucide-react"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ExamplePrompt {
  text: string
  description: string
}

export default function ChatInterface() {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isInitialRender, setIsInitialRender] = useState(true)

  const examplePrompts: ExamplePrompt[] = [
    { 
      text: "Summarize last week's updates", 
      description: "Get a summary of your recent work" 
    },
    { 
      text: "List my biggest accomplishments this quarter", 
      description: "View your key achievements" 
    },
    { 
      text: "What have I been working on in the last month?", 
      description: "Review your recent focus areas" 
    },
    { 
      text: "Identify any recurring blockers from my updates", 
      description: "Find patterns in challenges" 
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

  const handlePromptClick = (promptText: string) => {
    setInputValue(promptText)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim() || !user) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId: user.id
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
    }
  }

  const renderExamplePromptButtons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {examplePrompts.map((prompt, index) => (
        <Button 
          key={index}
          variant="outline" 
          className="h-auto py-2 px-3 w-full flex flex-col items-center justify-center"
          onClick={() => handlePromptClick(prompt.text)}
        >
          <div className="w-full overflow-hidden text-center">
            <p className="font-medium text-sm break-words line-clamp-2">{prompt.text}</p>
            <p className="text-xs text-muted-foreground mt-1">{prompt.description}</p>
          </div>
        </Button>
      ))}
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
              <p className="mb-4">Ask me anything about your standup updates!</p>
              
              <div className="w-full max-w-2xl mx-auto px-2">
                {renderExamplePromptButtons()}
              </div>
            </div>
          ) : (
            messages.map((message) => (
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
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4 border-t pt-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 flex">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="ghost" 
                    className="h-10 w-10 rounded-r-none border-r-0"
                    title="Suggestion prompts"
                  >
                    <LightbulbIcon className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-3" align="start" side="top">
                  <div className="space-y-2">
                    <h3 className="font-medium">Try asking about:</h3>
                    {renderExamplePromptButtons()}
                  </div>
                </PopoverContent>
              </Popover>
              
              <Textarea
                placeholder="Ask about your standup updates..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="min-h-[60px] rounded-l-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
              className="h-10"
            >
              {isLoading ? (
                <Loader2Icon className="h-5 w-5 animate-spin" />
              ) : (
                <SendIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 